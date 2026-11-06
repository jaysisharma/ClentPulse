"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const TOKEN_SECRET_KEY = 'frevio_api_token';
const CONFIG_FILENAME = '.frevio.json';
let statusBarItem;
let sendUpdateStatusBarItem;
let heartbeatTimer = null;
let lastActiveTime = Date.now();
let sessionActivityCount = 0;
let isTrackingPaused = false;
let currentConfig = null;
let todayTrackedHours = 0;
let todayBillableAmount = 0;
let unfocusedAt = null;
const seenEventSignatures = new Set();
async function activate(context) {
    // 1. Primary Status Bar Item (Shows Status, Billable & Quick Menu)
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'frevio.showMenu';
    context.subscriptions.push(statusBarItem);
    // 2. Companion Status Bar Item (Direct "Send Update" Action Button)
    sendUpdateStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    sendUpdateStatusBarItem.command = 'frevio.sendUpdate';
    sendUpdateStatusBarItem.text = '$(send) Frevio: Send Update';
    sendUpdateStatusBarItem.tooltip = 'Send progress update directly to client without opening web dashboard';
    context.subscriptions.push(sendUpdateStatusBarItem);
    // 3. Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('frevio.setToken', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your Frevio Extension API Token (from Settings > Editor Extension)',
            password: true,
            placeHolder: 'frev_live_...',
            ignoreFocusOut: true,
            validateInput: (text) => {
                if (!text.trim().startsWith('frev_live_')) {
                    return 'Token must start with frev_live_';
                }
                return null;
            },
        });
        if (token) {
            await context.secrets.store(TOKEN_SECRET_KEY, token.trim());
            vscode.window.showInformationMessage('Frevio API Token saved securely!');
            await refreshProjectConfig();
        }
    }), vscode.commands.registerCommand('frevio.linkProject', async () => {
        const token = await context.secrets.get(TOKEN_SECRET_KEY);
        if (!token) {
            const setNow = await vscode.window.showWarningMessage('Please set your Frevio API Token before linking a project.', 'Set Token');
            if (setNow === 'Set Token') {
                await vscode.commands.executeCommand('frevio.setToken');
            }
            return;
        }
        const workspaceFolder = getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Please open a workspace folder to link with Frevio.');
            return;
        }
        const apiBaseUrl = getApiBaseUrl();
        try {
            const res = await fetch(`${apiBaseUrl}/api/extension/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                if (res.status === 401) {
                    vscode.window.showErrorMessage('Invalid or expired Frevio API token. Please update your token.');
                }
                else {
                    vscode.window.showErrorMessage(`Failed to load projects: HTTP ${res.status}`);
                }
                return;
            }
            const data = (await res.json());
            if (!data.projects || data.projects.length === 0) {
                vscode.window.showInformationMessage('No active projects found in Frevio.');
                return;
            }
            const items = data.projects.map(p => ({
                label: p.project_name,
                description: `Client: ${p.client_name}`,
                projectId: p.id,
            }));
            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select the Frevio project to link this workspace with',
            });
            if (picked) {
                const configPath = path.join(workspaceFolder.uri.fsPath, CONFIG_FILENAME);
                const configData = {
                    projectId: picked.projectId,
                    projectName: picked.label,
                };
                fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
                currentConfig = configData;
                vscode.window.showInformationMessage(`Linked workspace to "${picked.label}"!`);
                updateStatusBar();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error connecting to Frevio: ${err.message}`);
        }
    }), vscode.commands.registerCommand('frevio.unlinkProject', async () => {
        const workspaceFolder = getWorkspaceFolder();
        if (!workspaceFolder)
            return;
        const configPath = path.join(workspaceFolder.uri.fsPath, CONFIG_FILENAME);
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
        currentConfig = null;
        todayTrackedHours = 0;
        todayBillableAmount = 0;
        updateStatusBar();
        vscode.window.showInformationMessage('Unlinked workspace from Frevio.');
    }), vscode.commands.registerCommand('frevio.toggleTracking', async () => {
        const wasTracking = !isTrackingPaused;
        isTrackingPaused = !isTrackingPaused;
        updateStatusBar();
        if (wasTracking && isTrackingPaused) {
            // Just paused: check if session wrap-up prompt should appear
            await checkSessionWrapUpPrompt(context);
        }
        else {
            vscode.window.showInformationMessage('Frevio tracking resumed.');
        }
    }), vscode.commands.registerCommand('frevio.sendUpdate', async () => {
        await promptAndSendUpdate(context, { isWrapUp: false });
    }), vscode.commands.registerCommand('frevio.aiDraftUpdate', async () => {
        await promptAiDraftUpdate(context);
    }), vscode.commands.registerCommand('frevio.viewSecrets', async () => {
        await promptViewSecrets(context);
    }), vscode.commands.registerCommand('frevio.wrapUpSession', async () => {
        isTrackingPaused = true;
        updateStatusBar();
        await promptAndSendUpdate(context, { isWrapUp: true });
    }), vscode.commands.registerCommand('frevio.uploadBuild', async (uri) => {
        await promptAndUploadBuild(context, uri);
    }), vscode.commands.registerCommand('frevio.logManualTime', async (suggestedMinutes) => {
        await promptLogManualTime(context, suggestedMinutes);
    }), vscode.commands.registerCommand('frevio.openPortal', () => {
        if (currentConfig?.projectId) {
            const apiBaseUrl = getApiBaseUrl();
            vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`));
        }
        else {
            vscode.commands.executeCommand('frevio.linkProject');
        }
    }), vscode.commands.registerCommand('frevio.viewApprovals', async () => {
        await promptViewApprovals(context);
    }), vscode.commands.registerCommand('frevio.openDashboard', () => {
        if (currentConfig?.projectId) {
            const apiBaseUrl = getApiBaseUrl();
            vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`));
        }
        else {
            vscode.commands.executeCommand('frevio.linkProject');
        }
    }), vscode.commands.registerCommand('frevio.showMenu', async () => {
        await showFrevioQuickMenu(context);
    }));
    // 4. Track activity events (typing, switching files, saving, window focus)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        lastActiveTime = Date.now();
        sessionActivityCount++;
    }), vscode.window.onDidChangeActiveTextEditor(() => {
        lastActiveTime = Date.now();
        sessionActivityCount++;
    }), vscode.workspace.onDidSaveTextDocument(() => {
        lastActiveTime = Date.now();
        sessionActivityCount++;
    }), vscode.workspace.onDidChangeWorkspaceFolders(async () => {
        await refreshProjectConfig();
    }), vscode.window.onDidChangeWindowState(async (state) => {
        if (!state.focused) {
            unfocusedAt = Date.now();
        }
        else if (unfocusedAt) {
            const awayMs = Date.now() - unfocusedAt;
            const awayMinutes = Math.round(awayMs / (60 * 1000));
            unfocusedAt = null;
            lastActiveTime = Date.now();
            const config = vscode.workspace.getConfiguration('frevio');
            const promptAway = config.get('promptAwayCatchUp', true);
            if (promptAway && currentConfig && !isTrackingPaused && awayMinutes >= 5 && awayMinutes <= 300) {
                await promptAwayCatchUpTime(context, awayMinutes);
            }
        }
    }));
    // 5. Initialize status & start heartbeat loop
    await refreshProjectConfig();
    startHeartbeatLoop(context);
}
function deactivate() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}
function getWorkspaceFolder() {
    return vscode.workspace.workspaceFolders?.[0];
}
function getApiBaseUrl() {
    const config = vscode.workspace.getConfiguration('frevio');
    let url = config.get('apiBaseUrl', 'https://www.frevio.cloud').trim().replace(/\/+$/, '');
    if (url === 'https://app.frevio.cloud' || url === 'http://app.frevio.cloud') {
        url = 'https://www.frevio.cloud';
    }
    return url;
}
function getHeartbeatIntervalSeconds() {
    const config = vscode.workspace.getConfiguration('frevio');
    return config.get('heartbeatIntervalSeconds', 120);
}
function getIdleTimeoutMinutes() {
    const config = vscode.workspace.getConfiguration('frevio');
    return config.get('idleTimeoutMinutes', 5);
}
function isPromptOnSessionWrapUp() {
    const config = vscode.workspace.getConfiguration('frevio');
    return config.get('promptOnSessionWrapUp', true);
}
function isShowBillableInStatusBar() {
    const config = vscode.workspace.getConfiguration('frevio');
    return config.get('showBillableInStatusBar', true);
}
function isEnableEditorNotifications() {
    const config = vscode.workspace.getConfiguration('frevio');
    return config.get('enableEditorNotifications', true);
}
async function refreshProjectConfig() {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        currentConfig = null;
        updateStatusBar();
        return;
    }
    const configPath = path.join(workspaceFolder.uri.fsPath, CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            currentConfig = JSON.parse(content);
        }
        catch {
            currentConfig = null;
        }
    }
    else {
        currentConfig = null;
    }
    updateStatusBar();
}
function updateStatusBar() {
    if (!statusBarItem || !sendUpdateStatusBarItem)
        return;
    if (!currentConfig) {
        statusBarItem.text = '$(plug) Frevio: Link Project';
        statusBarItem.tooltip = 'Click to link this workspace with a Frevio project.';
        statusBarItem.command = 'frevio.linkProject';
        statusBarItem.show();
        sendUpdateStatusBarItem.hide();
        return;
    }
    // Workspace is linked: Show both primary status item & companion update item
    sendUpdateStatusBarItem.show();
    const billableSuffix = isShowBillableInStatusBar() && (todayTrackedHours > 0 || todayBillableAmount > 0)
        ? ` (${todayTrackedHours}h · $${todayBillableAmount})`
        : '';
    if (isTrackingPaused) {
        statusBarItem.text = `$(debug-pause) Frevio: Paused${billableSuffix}`;
        statusBarItem.tooltip = `Tracking is paused on "${currentConfig.projectName}". Today: ${todayTrackedHours}h ($${todayBillableAmount}). Click for options.`;
        statusBarItem.command = 'frevio.showMenu';
        statusBarItem.show();
        return;
    }
    const idleTimeoutMs = getIdleTimeoutMinutes() * 60 * 1000;
    const isIdle = Date.now() - lastActiveTime > idleTimeoutMs;
    if (isIdle) {
        statusBarItem.text = `$(clock) Frevio: ${currentConfig.projectName}${billableSuffix} (Idle)`;
        statusBarItem.tooltip = `Inactive for > ${getIdleTimeoutMinutes()} mins. Tracking paused until you type. Today: ${todayTrackedHours}h ($${todayBillableAmount}). Click for options.`;
    }
    else {
        statusBarItem.text = `$(pulse) Frevio: ${currentConfig.projectName}${billableSuffix}`;
        statusBarItem.tooltip = `Actively tracking on "${currentConfig.projectName}". Today: ${todayTrackedHours}h ($${todayBillableAmount}). Click for options.`;
    }
    statusBarItem.command = 'frevio.showMenu';
    statusBarItem.show();
}
async function showFrevioQuickMenu(context) {
    if (!currentConfig) {
        await vscode.commands.executeCommand('frevio.linkProject');
        return;
    }
    const trackingLabel = isTrackingPaused ? '$(play) Resume Tracking' : '$(debug-pause) Pause Tracking';
    const trackingDesc = isTrackingPaused ? 'Resume sending active heartbeats' : 'Temporarily stop syncing presence';
    const items = [
        {
            label: '$(send) Send Update to Client',
            description: 'Post progress bullets & notify client without opening browser',
            action: 'sendUpdate',
        },
        {
            label: '$(sparkle) AI Draft Update from Git Commits',
            description: 'Auto-synthesize client bullets from your recent git commits',
            action: 'aiDraftUpdate',
        },
        {
            label: '$(clock) Log Time Spent in Chrome / External Apps',
            description: 'Record browser testing, research, or client meeting time',
            action: 'logManualTime',
        },
        {
            label: '$(checklist) View Pending Deliverables & Feedback',
            description: 'Review active client change requests and comments',
            action: 'viewApprovals',
        },
        {
            label: '$(lock) View / Insert Project Secret',
            description: 'Quickly access or insert encrypted credentials and API keys',
            action: 'viewSecrets',
        },
        {
            label: '$(sign-out) Wrap Up Coding Session',
            description: 'Pause tracking and draft progress summary for client',
            action: 'wrapUpSession',
        },
        {
            label: '$(cloud-upload) Upload Release Build',
            description: 'Share a test build (APK, IPA, ZIP, TAR.GZ) with your client',
            action: 'uploadBuild',
        },
        {
            label: trackingLabel,
            description: trackingDesc,
            action: 'toggleTracking',
        },
        {
            label: '$(globe) Open Client Status Portal',
            description: 'View public status page for this project',
            action: 'openPortal',
        },
        {
            label: '$(browser) Open Project in Frevio',
            description: 'Open dashboard in web browser',
            action: 'openDashboard',
        },
        {
            label: '$(sync) Switch / Link Different Project',
            description: 'Select another Frevio project for this workspace',
            action: 'linkProject',
        },
        {
            label: '$(x) Unlink Workspace',
            description: 'Remove .frevio.json link from this folder',
            action: 'unlinkProject',
        },
        {
            label: '$(key) Update API Token',
            description: 'Re-enter your Frevio extension API token',
            action: 'setToken',
        },
        {
            label: '$(server) Switch Environment (Localhost / Production)',
            description: `Current target: ${getApiBaseUrl()}`,
            action: 'switchEnvironment',
        },
    ];
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: `Frevio: ${currentConfig.projectName}${todayBillableAmount > 0 ? ` · Today: $${todayBillableAmount}` : ''}`,
    });
    if (!picked)
        return;
    switch (picked.action) {
        case 'sendUpdate':
            await vscode.commands.executeCommand('frevio.sendUpdate');
            break;
        case 'aiDraftUpdate':
            await vscode.commands.executeCommand('frevio.aiDraftUpdate');
            break;
        case 'logManualTime':
            await vscode.commands.executeCommand('frevio.logManualTime');
            break;
        case 'viewApprovals':
            await vscode.commands.executeCommand('frevio.viewApprovals');
            break;
        case 'viewSecrets':
            await vscode.commands.executeCommand('frevio.viewSecrets');
            break;
        case 'wrapUpSession':
            await vscode.commands.executeCommand('frevio.wrapUpSession');
            break;
        case 'uploadBuild':
            await vscode.commands.executeCommand('frevio.uploadBuild');
            break;
        case 'toggleTracking':
            await vscode.commands.executeCommand('frevio.toggleTracking');
            break;
        case 'openPortal': {
            const apiBaseUrl = getApiBaseUrl();
            vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`));
            break;
        }
        case 'openDashboard':
            await vscode.commands.executeCommand('frevio.openDashboard');
            break;
        case 'linkProject':
            await vscode.commands.executeCommand('frevio.linkProject');
            break;
        case 'unlinkProject':
            await vscode.commands.executeCommand('frevio.unlinkProject');
            break;
        case 'setToken':
            await vscode.commands.executeCommand('frevio.setToken');
            break;
        case 'switchEnvironment': {
            const current = getApiBaseUrl();
            const picked = await vscode.window.showQuickPick([
                { label: '$(home) Localhost Development', description: 'http://localhost:3000', target: 'http://localhost:3000' },
                { label: '$(cloud) Production Cloud', description: 'https://www.frevio.cloud', target: 'https://www.frevio.cloud' },
                { label: '$(gear) Custom URL...', description: 'Specify custom host', target: 'custom' },
            ], { placeHolder: `Switch API URL (currently: ${current})` });
            if (picked) {
                let finalUrl = picked.target;
                if (finalUrl === 'custom') {
                    const input = await vscode.window.showInputBox({
                        prompt: 'Enter custom API Base URL (e.g. http://localhost:3000)',
                        value: current,
                    });
                    if (!input)
                        break;
                    finalUrl = input.trim();
                }
                const config = vscode.workspace.getConfiguration('frevio');
                await config.update('apiBaseUrl', finalUrl, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Switched Frevio API URL to ${finalUrl}`);
                await refreshProjectConfig();
            }
            break;
        }
    }
}
async function checkSessionWrapUpPrompt(context) {
    if (!currentConfig || !isPromptOnSessionWrapUp() || sessionActivityCount < 3) {
        vscode.window.showInformationMessage('Frevio tracking paused.');
        return;
    }
    const choice = await vscode.window.showInformationMessage(`Tracking paused. Would you like to send what you completed on "${currentConfig.projectName}" to your client?`, 'Send Update to Client', 'Just Pause', "Don't Ask Again");
    if (choice === 'Send Update to Client') {
        await promptAndSendUpdate(context, { isWrapUp: true });
    }
    else if (choice === "Don't Ask Again") {
        const config = vscode.workspace.getConfiguration('frevio');
        await config.update('promptOnSessionWrapUp', false, vscode.ConfigurationTarget.Global);
    }
}
async function promptAndSendUpdate(context, options = {}) {
    // 1. Verify token
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token) {
        const setNow = await vscode.window.showWarningMessage('Please set your Frevio API Token before sending updates.', 'Set Token');
        if (setNow === 'Set Token') {
            await vscode.commands.executeCommand('frevio.setToken');
        }
        return;
    }
    // 2. Verify workspace is linked
    if (!currentConfig) {
        const linkNow = await vscode.window.showWarningMessage('This workspace is not linked to a Frevio project. Link it first to send client updates.', 'Link Project');
        if (linkNow === 'Link Project') {
            await vscode.commands.executeCommand('frevio.linkProject');
        }
        return;
    }
    // 3. Prompt for update bullets
    const prefixTitle = options.isWrapUp ? 'Session Wrap-Up' : 'Client Progress Update';
    const rawBulletsInput = await vscode.window.showInputBox({
        prompt: `[${prefixTitle}] What did you complete on "${currentConfig.projectName}"? (Separate multiple bullets with semicolons or newlines)`,
        placeHolder: 'e.g. Fixed checkout responsive layout; Added automated email test; Updated API endpoints',
        ignoreFocusOut: true,
        validateInput: (text) => {
            const items = text.split(/[;\n]/).map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
            if (items.length === 0) {
                return 'Please enter at least one progress bullet point';
            }
            return null;
        },
    });
    if (!rawBulletsInput)
        return;
    const bullets = rawBulletsInput
        .split(/[;\n]/)
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
    if (bullets.length === 0) {
        vscode.window.showWarningMessage('No bullet points were provided. Update was cancelled.');
        return;
    }
    // 4. Prompt for optional note/summary
    const noteInput = await vscode.window.showInputBox({
        prompt: `[Optional] Add a summary note for the client (Press Enter to skip)`,
        placeHolder: 'e.g. All daily milestones complete and verified on local environment.',
        ignoreFocusOut: true,
    });
    // 5. Send with progress indicator
    const apiBaseUrl = getApiBaseUrl();
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Sending progress update to ${currentConfig.projectName}...`,
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 20 });
        try {
            const res = await fetch(`${apiBaseUrl}/api/extension/updates`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: currentConfig?.projectId,
                    bullets,
                    note: noteInput && noteInput.trim().length > 0 ? noteInput.trim() : undefined,
                }),
            });
            progress.report({ increment: 70 });
            if (!res.ok) {
                const errData = (await res.json().catch(() => ({})));
                if (res.status === 401) {
                    vscode.window.showErrorMessage('Invalid Frevio API token. Please update your token in Settings.');
                }
                else {
                    vscode.window.showErrorMessage(`Failed to send update: ${errData.error || `HTTP ${res.status}`}`);
                }
                return;
            }
            const data = (await res.json());
            // Reset session activity counter since update was posted
            sessionActivityCount = 0;
            const emailDetail = data.emailSent
                ? ` (emailed to ${data.clientEmail || 'client'})`
                : '';
            const successMsg = `Progress update sent to ${data.clientName || currentConfig?.projectName}${emailDetail}!`;
            const action = await vscode.window.showInformationMessage(successMsg, 'View Client Portal', 'OK');
            if (action === 'View Client Portal' && data.portalUrl) {
                vscode.env.openExternal(vscode.Uri.parse(data.portalUrl));
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error sending update to Frevio: ${err.message}`);
        }
    });
}
/**
 * AI Git Commit-to-Client-Update generator:
 * Reads recent git commit log and asks Frevio AI to synthesize polite, client-ready bullets.
 */
async function promptAiDraftUpdate(context) {
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token) {
        const setNow = await vscode.window.showWarningMessage('Please set your Frevio API Token before drafting updates.', 'Set Token');
        if (setNow === 'Set Token') {
            await vscode.commands.executeCommand('frevio.setToken');
        }
        return;
    }
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder || !currentConfig) {
        const linkNow = await vscode.window.showWarningMessage('Link this workspace to a Frevio project to draft AI client updates.', 'Link Project');
        if (linkNow === 'Link Project') {
            await vscode.commands.executeCommand('frevio.linkProject');
        }
        return;
    }
    // 1. Gather git commits
    let gitMessages = [];
    try {
        const output = (0, child_process_1.execSync)('git log -n 5 --oneline', {
            cwd: workspaceFolder.uri.fsPath,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });
        gitMessages = output.split('\n').map(l => l.trim()).filter(Boolean);
    }
    catch {
        // Non-git repo or git not available, backend handles fallback bullets gracefully
    }
    const apiBaseUrl = getApiBaseUrl();
    const draftResult = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Frevio AI: Analyzing recent git commits...',
        cancellable: false,
    }, async (progress) => {
        try {
            progress.report({ increment: 30 });
            const res = await fetch(`${apiBaseUrl}/api/extension/ai-draft`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: currentConfig?.projectId,
                    gitMessages,
                }),
            });
            progress.report({ increment: 60 });
            if (res.ok) {
                const data = (await res.json());
                return {
                    bullets: data.bullets || [],
                    note: data.note || '',
                };
            }
            else {
                vscode.window.showErrorMessage(`Failed to generate AI draft: HTTP ${res.status}`);
                return null;
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error generating AI draft: ${err.message}`);
            return null;
        }
    });
    if (!draftResult)
        return;
    // 2. Review and edit synthesized bullets
    const prefilledBullets = draftResult.bullets.join('; ');
    const editedBullets = await vscode.window.showInputBox({
        prompt: `[AI Draft] Review and edit client update bullets (separated by semicolons):`,
        value: prefilledBullets,
        ignoreFocusOut: true,
        validateInput: (text) => {
            const items = text.split(/[;\n]/).map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
            if (items.length === 0)
                return 'Please provide at least one bullet point';
            return null;
        },
    });
    if (!editedBullets)
        return;
    const bullets = editedBullets
        .split(/[;\n]/)
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
    // 3. Review note
    const editedNote = await vscode.window.showInputBox({
        prompt: `[AI Draft] Review client note (press Enter to accept):`,
        value: draftResult.note,
        ignoreFocusOut: true,
    });
    // 4. Publish update
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Publishing AI update to ${currentConfig.projectName}...`,
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 30 });
        try {
            const res = await fetch(`${apiBaseUrl}/api/extension/updates`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: currentConfig?.projectId,
                    bullets,
                    note: editedNote && editedNote.trim().length > 0 ? editedNote.trim() : undefined,
                }),
            });
            progress.report({ increment: 70 });
            if (!res.ok) {
                const errData = (await res.json().catch(() => ({})));
                vscode.window.showErrorMessage(`Failed to send update: ${errData.error || `HTTP ${res.status}`}`);
                return;
            }
            const data = (await res.json());
            sessionActivityCount = 0;
            const action = await vscode.window.showInformationMessage(`AI progress update published to ${data.clientName || currentConfig?.projectName}!`, 'View Client Portal', 'OK');
            if (action === 'View Client Portal' && data.portalUrl) {
                vscode.env.openExternal(vscode.Uri.parse(data.portalUrl));
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error sending update: ${err.message}`);
        }
    });
}
/**
 * Encrypted Secret Vault quick-access:
 * Lists project credentials, lets developer copy to clipboard or insert directly at cursor.
 */
async function promptViewSecrets(context) {
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token) {
        const setNow = await vscode.window.showWarningMessage('Please set your Frevio API Token before accessing the secret vault.', 'Set Token');
        if (setNow === 'Set Token') {
            await vscode.commands.executeCommand('frevio.setToken');
        }
        return;
    }
    if (!currentConfig) {
        const linkNow = await vscode.window.showWarningMessage('Link this workspace to a Frevio project to access its secret vault.', 'Link Project');
        if (linkNow === 'Link Project') {
            await vscode.commands.executeCommand('frevio.linkProject');
        }
        return;
    }
    const apiBaseUrl = getApiBaseUrl();
    let secretsList = [];
    try {
        const res = await fetch(`${apiBaseUrl}/api/extension/secrets?projectId=${currentConfig.projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            if (res.status === 401) {
                vscode.window.showErrorMessage('Invalid Frevio API token. Please update your token in Settings.');
            }
            else {
                vscode.window.showErrorMessage(`Failed to load secrets: HTTP ${res.status}`);
            }
            return;
        }
        const data = (await res.json());
        secretsList = data.secrets || [];
    }
    catch (err) {
        vscode.window.showErrorMessage(`Error accessing secret vault: ${err.message}`);
        return;
    }
    if (secretsList.length === 0) {
        vscode.window.showInformationMessage(`No secrets stored in "${currentConfig.projectName}". Add API keys or credentials in Project Settings > Secret Vault.`);
        return;
    }
    const items = secretsList.map(s => ({
        label: `$(lock) ${s.title}`,
        description: `[${s.category}] ${s.notes || ''}`.trim(),
        detail: `Masked: ${s.maskedValue}`,
        secretId: s.id,
        title: s.title,
    }));
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: `Select a secret from ${currentConfig.projectName}'s vault`,
    });
    if (!picked)
        return;
    const actionItems = [
        {
            label: '$(clippy) Copy to Clipboard',
            description: 'Decrypt and copy credential directly to your clipboard',
            action: 'copy',
        },
        {
            label: '$(edit) Insert at Cursor',
            description: 'Insert decrypted secret directly at current editor cursor',
            action: 'insert',
        },
    ];
    const pickedAction = await vscode.window.showQuickPick(actionItems, {
        placeHolder: `Action for "${picked.title}"`,
    });
    if (!pickedAction)
        return;
    try {
        const revealRes = await fetch(`${apiBaseUrl}/api/extension/secrets`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                projectId: currentConfig.projectId,
                secretId: picked.secretId,
            }),
        });
        if (!revealRes.ok) {
            vscode.window.showErrorMessage(`Failed to decrypt secret: HTTP ${revealRes.status}`);
            return;
        }
        const revealData = (await revealRes.json());
        const secretValue = revealData.value;
        if (pickedAction.action === 'copy') {
            await vscode.env.clipboard.writeText(secretValue);
            vscode.window.showInformationMessage(`Secret "${picked.title}" copied to clipboard! (Audit log recorded)`);
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                await vscode.env.clipboard.writeText(secretValue);
                vscode.window.showInformationMessage(`No active text editor. Secret "${picked.title}" copied to clipboard instead.`);
            }
            else {
                await editor.edit(builder => {
                    builder.insert(editor.selection.active, secretValue);
                });
                vscode.window.showInformationMessage(`Secret "${picked.title}" inserted at cursor! (Audit log recorded)`);
            }
        }
    }
    catch (err) {
        vscode.window.showErrorMessage(`Error decrypting secret: ${err.message}`);
    }
}
const BUILD_ENVIRONMENTS = [
    { label: 'Client Review', description: 'Ready for the client to test and approve', value: 'client_review' },
    { label: 'Staging / Test Build', description: 'Work in progress, may have rough edges', value: 'staging' },
    { label: 'Internal Beta', description: 'Early build for internal testing', value: 'internal_beta' },
    { label: 'Production Release', description: 'Final release build', value: 'production' },
];
function getContentTypeForBuild(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.apk'))
        return 'application/vnd.android.package-archive';
    if (lower.endsWith('.ipa'))
        return 'application/octet-stream';
    if (lower.endsWith('.zip'))
        return 'application/zip';
    if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz'))
        return 'application/gzip';
    return 'application/octet-stream';
}
function isSupportedBuildFile(filePath) {
    return /\.(apk|ipa|zip|tar\.gz)$/i.test(filePath);
}
/** Reads versionName/versionCode from output-metadata.json Gradle writes next to the APK. */
function readApkMetadata(apkPath) {
    try {
        const metaPath = path.join(path.dirname(apkPath), 'output-metadata.json');
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const element = meta.elements?.find((e) => e.outputFile === path.basename(apkPath)) ?? meta.elements?.[0];
        return {
            versionName: element?.versionName ? String(element.versionName) : undefined,
            versionCode: element?.versionCode != null ? String(element.versionCode) : undefined,
        };
    }
    catch {
        return {};
    }
}
function readBuildMetadata(filePath) {
    if (filePath.toLowerCase().endsWith('.apk')) {
        return readApkMetadata(filePath);
    }
    const match = path.basename(filePath).match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (match) {
        return { versionName: `v${match[1]}` };
    }
    return {};
}
async function pickBuildFile() {
    const found = await vscode.workspace.findFiles('**/*.{apk,ipa,zip,tar.gz}', '**/node_modules/**', 50);
    const builds = found
        .map(uri => ({ fsPath: uri.fsPath, mtime: fs.statSync(uri.fsPath).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
    const browse = async () => {
        const picked = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            openLabel: 'Upload to Frevio',
            title: 'Select a build (APK, IPA, ZIP, TAR.GZ) to share with your client',
            filters: {
                'Application & Release Builds': ['apk', 'ipa', 'zip', 'gz'],
                'All Files': ['*'],
            },
        });
        return picked?.[0]?.fsPath;
    };
    if (builds.length === 0)
        return browse();
    const workspaceRoot = getWorkspaceFolder()?.uri.fsPath ?? '';
    const items = builds.map(b => ({
        label: `$(file-binary) ${path.basename(b.fsPath)}`,
        description: path.relative(workspaceRoot, path.dirname(b.fsPath)),
        detail: `Built ${new Date(b.mtime).toLocaleString()} · ${(fs.statSync(b.fsPath).size / (1024 * 1024)).toFixed(1)} MB`,
        fsPath: b.fsPath,
    }));
    items.push({ label: '$(folder-opened) Browse for another build file...' });
    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: 'Which release build do you want to send to your client?',
    });
    if (!picked)
        return undefined;
    return picked.fsPath ?? browse();
}
async function promptAndUploadBuild(context, uri) {
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token) {
        const setNow = await vscode.window.showWarningMessage('Please set your Frevio API Token before uploading builds.', 'Set Token');
        if (setNow === 'Set Token') {
            await vscode.commands.executeCommand('frevio.setToken');
        }
        return;
    }
    if (!currentConfig) {
        const linkNow = await vscode.window.showWarningMessage('This workspace is not linked to a Frevio project. Link it first to upload builds.', 'Link Project');
        if (linkNow === 'Link Project') {
            await vscode.commands.executeCommand('frevio.linkProject');
        }
        return;
    }
    const config = currentConfig;
    // 1. Pick the build file (or use the one right-clicked in the explorer)
    const buildPath = uri?.fsPath && isSupportedBuildFile(uri.fsPath) ? uri.fsPath : await pickBuildFile();
    if (!buildPath)
        return;
    const fileName = path.basename(buildPath);
    const fileSize = fs.statSync(buildPath).size;
    const meta = readBuildMetadata(buildPath);
    const contentType = getContentTypeForBuild(fileName);
    // 2. Release details
    const versionName = await vscode.window.showInputBox({
        prompt: `Version name for ${fileName}`,
        placeHolder: 'e.g. v1.0.4',
        value: meta.versionName ? `v${meta.versionName.replace(/^v/i, '')}` : '',
        ignoreFocusOut: true,
        validateInput: (text) => (text.trim() ? null : 'Version name is required'),
    });
    if (!versionName)
        return;
    const buildNumber = await vscode.window.showInputBox({
        prompt: '[Optional] Build number (Press Enter to skip)',
        placeHolder: 'e.g. 42',
        value: meta.versionCode ?? '',
        ignoreFocusOut: true,
    });
    if (buildNumber === undefined)
        return;
    const environment = await vscode.window.showQuickPick(BUILD_ENVIRONMENTS, {
        placeHolder: 'What kind of build is this?',
    });
    if (!environment)
        return;
    const changelog = await vscode.window.showInputBox({
        prompt: "[Optional] What's new in this build? (Separate items with semicolons, press Enter to skip)",
        placeHolder: 'e.g. Fixed login crash; New onboarding screens',
        ignoreFocusOut: true,
    });
    if (changelog === undefined)
        return;
    const notify = await vscode.window.showQuickPick([
        { label: '$(mail) Yes, email my client', value: true },
        { label: '$(circle-slash) No, just add it to the portal', value: false },
    ], { placeHolder: 'Email your client that a new build is ready?' });
    if (!notify)
        return;
    // 3. Upload straight to storage, then publish
    const apiBaseUrl = getApiBaseUrl();
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Uploading ${fileName} to ${config.projectName}`,
        cancellable: false,
    }, async (progress) => {
        try {
            progress.report({ message: 'Preparing upload...' });
            const urlRes = await fetch(`${apiBaseUrl}/api/extension/builds/upload-url`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: config.projectId, fileName, size: fileSize }),
            });
            if (!urlRes.ok) {
                const errData = (await urlRes.json().catch(() => ({})));
                vscode.window.showErrorMessage(urlRes.status === 401
                    ? 'Invalid Frevio API token. Please update your token in Settings.'
                    : `Failed to start upload: ${errData.error || `HTTP ${urlRes.status}`}`);
                return;
            }
            const { path: storagePath, signedUrl } = (await urlRes.json());
            progress.report({ increment: 10, message: `Uploading ${(fileSize / (1024 * 1024)).toFixed(1)} MB...` });
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': contentType, 'x-upsert': 'false' },
                body: fs.readFileSync(buildPath),
            });
            if (!uploadRes.ok) {
                const errText = await uploadRes.text().catch(() => '');
                vscode.window.showErrorMessage(`Build upload failed: ${errText || `HTTP ${uploadRes.status}`}`);
                return;
            }
            progress.report({ increment: 75, message: 'Publishing to client portal...' });
            const detectedPlatform = /\.ipa$/i.test(fileName)
                ? 'ios'
                : /\.apk$/i.test(fileName)
                    ? 'android'
                    : 'universal';
            const res = await fetch(`${apiBaseUrl}/api/extension/builds`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: config.projectId,
                    path: storagePath,
                    fileSizeBytes: fileSize,
                    versionName: versionName.trim(),
                    buildNumber: buildNumber.trim() || undefined,
                    platform: detectedPlatform,
                    environment: environment.value,
                    changelog: changelog
                        .split(';')
                        .map(s => s.trim())
                        .filter(Boolean)
                        .map(s => `• ${s}`)
                        .join('\n') || undefined,
                    notifyClient: notify.value,
                }),
            });
            if (!res.ok) {
                const errData = (await res.json().catch(() => ({})));
                vscode.window.showErrorMessage(`Failed to publish build: ${errData.error || `HTTP ${res.status}`}`);
                return;
            }
            const data = (await res.json());
            progress.report({ increment: 15 });
            const emailDetail = data.emailSent ? ` and emailed ${data.clientEmail || 'your client'}` : '';
            const action = await vscode.window.showInformationMessage(`${versionName.trim()} is live in ${data.clientName || config.projectName}'s portal${emailDetail}.`, 'View Client Portal', 'OK');
            if (action === 'View Client Portal' && data.portalUrl) {
                vscode.env.openExternal(vscode.Uri.parse(data.portalUrl));
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error uploading build to Frevio: ${err.message}`);
        }
    });
}
function detectFocusArea() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return 'Coding';
    const fileName = editor.document.fileName.toLowerCase();
    if (fileName.includes('.test.') ||
        fileName.includes('.spec.') ||
        fileName.includes('/test/') ||
        fileName.includes('/tests/') ||
        fileName.includes('/__tests__/')) {
        return 'Testing & Quality';
    }
    if (fileName.endsWith('.tsx') ||
        fileName.endsWith('.jsx') ||
        fileName.endsWith('.vue') ||
        fileName.endsWith('.svelte') ||
        fileName.endsWith('.html') ||
        fileName.endsWith('.css') ||
        fileName.endsWith('.scss') ||
        fileName.includes('/components/') ||
        fileName.includes('/ui/')) {
        return 'Frontend & UI';
    }
    if (fileName.includes('/api/') ||
        fileName.includes('/server/') ||
        fileName.endsWith('.sql') ||
        fileName.endsWith('.prisma') ||
        fileName.endsWith('.go') ||
        fileName.endsWith('.rs') ||
        fileName.endsWith('.py')) {
        return 'Backend & API';
    }
    if (fileName.endsWith('.md') || fileName.endsWith('.mdx') || fileName.includes('/docs/')) {
        return 'Documentation';
    }
    return 'Development';
}
function startHeartbeatLoop(context) {
    if (heartbeatTimer)
        clearInterval(heartbeatTimer);
    const intervalSecs = getHeartbeatIntervalSeconds();
    const intervalMs = intervalSecs * 1000;
    heartbeatTimer = setInterval(async () => {
        updateStatusBar();
        if (isTrackingPaused || !currentConfig)
            return;
        const idleTimeoutMs = getIdleTimeoutMinutes() * 60 * 1000;
        const timeSinceActive = Date.now() - lastActiveTime;
        if (timeSinceActive > idleTimeoutMs) {
            // User is idle, do not send heartbeats
            return;
        }
        const token = await context.secrets.get(TOKEN_SECRET_KEY);
        if (!token)
            return;
        const apiBaseUrl = getApiBaseUrl();
        const focusArea = detectFocusArea();
        try {
            const res = await fetch(`${apiBaseUrl}/api/extension/heartbeat`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: currentConfig.projectId,
                    focusArea,
                    intervalSeconds: intervalSecs,
                }),
            });
            if (res.ok) {
                const data = (await res.json().catch(() => ({})));
                if (typeof data.todayHours === 'number') {
                    todayTrackedHours = data.todayHours;
                }
                if (typeof data.billableToday === 'number') {
                    todayBillableAmount = data.billableToday;
                }
                updateStatusBar();
                // Handle real-time notifications in VS Code
                if (isEnableEditorNotifications() && Array.isArray(data.events)) {
                    for (const ev of data.events) {
                        if (ev.message && !seenEventSignatures.has(ev.message)) {
                            seenEventSignatures.add(ev.message);
                            vscode.window.showInformationMessage(ev.message, 'Open Portal').then(action => {
                                if (action === 'Open Portal' && currentConfig?.projectId) {
                                    vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`));
                                }
                            });
                        }
                    }
                }
            }
        }
        catch {
            // Silently ignore transient network blips
        }
    }, intervalMs);
}
async function promptAwayCatchUpTime(context, awayMinutes) {
    if (!currentConfig)
        return;
    const action = await vscode.window.showInformationMessage(`You were outside VS Code for ~${awayMinutes}m (e.g. testing in Chrome / meetings). Would you like to log this time to "${currentConfig.projectName}"?`, `Log ${awayMinutes}m`, 'Custom...', 'Ignore');
    if (action === `Log ${awayMinutes}m`) {
        await recordManualTimeEntry(context, awayMinutes, 'Browser testing & external work');
    }
    else if (action === 'Custom...') {
        await promptLogManualTime(context, awayMinutes);
    }
}
async function promptLogManualTime(context, defaultMinutes) {
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token) {
        const setNow = await vscode.window.showWarningMessage('Please set your Frevio API Token first.', 'Set Token');
        if (setNow === 'Set Token')
            await vscode.commands.executeCommand('frevio.setToken');
        return;
    }
    if (!currentConfig) {
        const linkNow = await vscode.window.showWarningMessage('Please link your workspace to a project first.', 'Link Project');
        if (linkNow === 'Link Project')
            await vscode.commands.executeCommand('frevio.linkProject');
        return;
    }
    const rawMinutes = await vscode.window.showInputBox({
        prompt: `[${currentConfig.projectName}] Enter minutes spent working outside VS Code (e.g. Chrome, Figma, research)`,
        value: String(defaultMinutes && defaultMinutes > 0 ? defaultMinutes : 30),
        placeHolder: 'e.g. 45',
        ignoreFocusOut: true,
        validateInput: val => {
            const n = parseFloat(val);
            if (isNaN(n) || n <= 0 || n > 1440) {
                return 'Please enter a valid number of minutes (1 to 1440)';
            }
            return null;
        },
    });
    if (!rawMinutes)
        return;
    const minutes = parseFloat(rawMinutes);
    const categoryChoices = [
        { label: '$(globe) Browser Testing & Web QA', description: 'Testing localhost, responsive layouts, DevTools inspect' },
        { label: '$(book) Research & Documentation', description: 'Reading API docs, technical references, library research' },
        { label: '$(call-outgoing) Client Meeting & Strategy', description: 'Video call, sync session, requirement gathering' },
        { label: '$(paintcan) Figma & Design Review', description: 'Inspecting mockups, exporting tokens, design QA' },
        { label: '$(edit) Custom Memo...', description: 'Enter a custom note for this time entry' },
    ];
    const pickedCategory = await vscode.window.showQuickPick(categoryChoices, {
        placeHolder: 'Select activity category or memo',
    });
    if (!pickedCategory)
        return;
    let memo = pickedCategory.label.replace(/^\$\([a-z0-9-]+\)\s*/, '');
    if (pickedCategory.label.includes('Custom Memo')) {
        const customMemo = await vscode.window.showInputBox({
            prompt: 'Enter a brief memo for this time entry',
            placeHolder: 'e.g. Investigating Stripe webhook signature verification in Chrome',
            ignoreFocusOut: true,
        });
        if (!customMemo)
            return;
        memo = customMemo.trim();
    }
    await recordManualTimeEntry(context, minutes, memo);
}
async function recordManualTimeEntry(context, minutes, description) {
    if (!currentConfig)
        return;
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token)
        return;
    const apiBaseUrl = getApiBaseUrl();
    const hours = Math.round((minutes / 60) * 100) / 100;
    try {
        const res = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Logging ${minutes}m to ${currentConfig.projectName}...` }, async () => {
            return await fetch(`${apiBaseUrl}/api/extension/time-entry`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: currentConfig?.projectId,
                    hours,
                    description,
                }),
            });
        });
        if (!res.ok) {
            const errData = (await res.json().catch(() => ({})));
            if (res.status === 404 && apiBaseUrl.includes('frevio.cloud')) {
                const action = await vscode.window.showErrorMessage(`Failed to log time: Endpoint /api/extension/time-entry is not yet deployed to production (${apiBaseUrl}). If you are running locally, switch to http://localhost:3000.`, 'Switch to Localhost (3000)', 'Dismiss');
                if (action === 'Switch to Localhost (3000)') {
                    const config = vscode.workspace.getConfiguration('frevio');
                    await config.update('apiBaseUrl', 'http://localhost:3000', vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('Updated Frevio API URL to http://localhost:3000. Try logging time again!');
                }
                return;
            }
            vscode.window.showErrorMessage(`Failed to log time: ${errData.error || `HTTP ${res.status}`}`);
            return;
        }
        const data = (await res.json());
        todayTrackedHours = data.todayHours;
        todayBillableAmount = data.billableToday;
        updateStatusBar();
        vscode.window.showInformationMessage(`✓ Logged ${minutes}m ("${description}") to "${currentConfig.projectName}". Today: ${todayTrackedHours}h ($${todayBillableAmount}).`);
    }
    catch (err) {
        vscode.window.showErrorMessage(`Error logging time: ${err.message}`);
    }
}
async function promptViewApprovals(context) {
    if (!currentConfig) {
        vscode.commands.executeCommand('frevio.linkProject');
        return;
    }
    const token = await context.secrets.get(TOKEN_SECRET_KEY);
    if (!token) {
        vscode.commands.executeCommand('frevio.setToken');
        return;
    }
    const apiBaseUrl = getApiBaseUrl();
    try {
        const res = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Fetching client feedback...' }, async () => {
            return await fetch(`${apiBaseUrl}/api/extension/figma/feedback?projectId=${currentConfig?.projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
        if (!res.ok) {
            vscode.window.showErrorMessage(`Failed to fetch client feedback: HTTP ${res.status}`);
            return;
        }
        const data = (await res.json());
        const items = data.feedback || [];
        if (items.length === 0) {
            vscode.window.showInformationMessage(`No pending change requests or comments on "${currentConfig.projectName}". All deliverables approved!`);
            return;
        }
        const pickItems = items.map(f => ({
            label: f.type === 'revision_request' ? `$(alert) ${f.title}` : `$(comment) ${f.author}: ${f.title}`,
            description: f.text.slice(0, 70) + (f.text.length > 70 ? '...' : ''),
            detail: `${f.author} • ${new Date(f.createdAt).toLocaleDateString()}`,
            feedback: f,
        }));
        const picked = await vscode.window.showQuickPick(pickItems, {
            placeHolder: `Client Feedback & Change Requests (${items.length} unaddressed)`,
        });
        if (picked) {
            const choice = await vscode.window.showInformationMessage(`[${picked.feedback.author}] ${picked.feedback.text}`, 'Open Project in Browser', 'Copy Feedback to Clipboard');
            if (choice === 'Open Project in Browser') {
                vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`));
            }
            else if (choice === 'Copy Feedback to Clipboard') {
                await vscode.env.clipboard.writeText(picked.feedback.text);
                vscode.window.showInformationMessage('Copied client feedback to clipboard!');
            }
        }
    }
    catch (err) {
        vscode.window.showErrorMessage(`Error fetching feedback: ${err.message}`);
    }
}
//# sourceMappingURL=extension.js.map