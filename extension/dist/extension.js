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
const TOKEN_SECRET_KEY = 'frevio_api_token';
const CONFIG_FILENAME = '.frevio.json';
let statusBarItem;
let heartbeatTimer = null;
let lastActiveTime = Date.now();
let isTrackingPaused = false;
let currentConfig = null;
async function activate(context) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'frevio.linkProject';
    context.subscriptions.push(statusBarItem);
    // 1. Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('frevio.setToken', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your Frevio Extension API Token (from Settings > Editor Extension)',
            password: true,
            placeHolder: 'frev_live_...',
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
        updateStatusBar();
        vscode.window.showInformationMessage('Unlinked workspace from Frevio.');
    }), vscode.commands.registerCommand('frevio.toggleTracking', () => {
        isTrackingPaused = !isTrackingPaused;
        updateStatusBar();
        vscode.window.showInformationMessage(isTrackingPaused ? 'Frevio tracking paused.' : 'Frevio tracking resumed.');
    }), vscode.commands.registerCommand('frevio.openDashboard', () => {
        if (currentConfig?.projectId) {
            const apiBaseUrl = getApiBaseUrl();
            vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`));
        }
        else {
            vscode.commands.executeCommand('frevio.linkProject');
        }
    }));
    // 2. Track activity events (typing, switching files, saving)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        lastActiveTime = Date.now();
    }), vscode.window.onDidChangeActiveTextEditor(() => {
        lastActiveTime = Date.now();
    }), vscode.workspace.onDidSaveTextDocument(() => {
        lastActiveTime = Date.now();
    }));
    // 3. Initialize status & start heartbeat loop
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
    // Gracefully migrate legacy/misconfigured app.frevio.cloud subdomain
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
    if (!statusBarItem)
        return;
    if (isTrackingPaused) {
        statusBarItem.text = '$(debug-pause) Frevio: Paused';
        statusBarItem.tooltip = 'Frevio tracking is paused. Click to open project.';
        statusBarItem.command = 'frevio.toggleTracking';
        statusBarItem.show();
        return;
    }
    if (!currentConfig) {
        statusBarItem.text = '$(plug) Frevio: Link Project';
        statusBarItem.tooltip = 'Click to link this workspace with a Frevio project.';
        statusBarItem.command = 'frevio.linkProject';
        statusBarItem.show();
        return;
    }
    const idleTimeoutMs = getIdleTimeoutMinutes() * 60 * 1000;
    const isIdle = Date.now() - lastActiveTime > idleTimeoutMs;
    if (isIdle) {
        statusBarItem.text = `$(clock) Frevio: ${currentConfig.projectName} (Idle)`;
        statusBarItem.tooltip = 'Inactive for > 5 mins. Tracking paused until you type.';
    }
    else {
        statusBarItem.text = `$(pulse) Frevio: ${currentConfig.projectName}`;
        statusBarItem.tooltip = `Actively tracking on "${currentConfig.projectName}". Click to open in Frevio.`;
    }
    statusBarItem.command = 'frevio.openDashboard';
    statusBarItem.show();
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
            await fetch(`${apiBaseUrl}/api/extension/heartbeat`, {
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
        }
        catch {
            // Silently ignore transient network blips
        }
    }, intervalMs);
}
//# sourceMappingURL=extension.js.map