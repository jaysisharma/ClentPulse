import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

interface FrevioConfig {
  projectId: string
  projectName: string
}

const TOKEN_SECRET_KEY = 'frevio_api_token'
const CONFIG_FILENAME = '.frevio.json'

let statusBarItem: vscode.StatusBarItem
let sendUpdateStatusBarItem: vscode.StatusBarItem
let heartbeatTimer: NodeJS.Timeout | null = null
let lastActiveTime = Date.now()
let sessionActivityCount = 0
let isTrackingPaused = false
let currentConfig: FrevioConfig | null = null

export async function activate(context: vscode.ExtensionContext) {
  // 1. Primary Status Bar Item (Shows Status & Quick Menu)
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.command = 'frevio.showMenu'
  context.subscriptions.push(statusBarItem)

  // 2. Companion Status Bar Item (Direct "Send Update" Action Button)
  sendUpdateStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99)
  sendUpdateStatusBarItem.command = 'frevio.sendUpdate'
  sendUpdateStatusBarItem.text = '$(send) Frevio: Send Update'
  sendUpdateStatusBarItem.tooltip = 'Send progress update directly to client without opening web dashboard'
  context.subscriptions.push(sendUpdateStatusBarItem)

  // 3. Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('frevio.setToken', async () => {
      const token = await vscode.window.showInputBox({
        prompt: 'Enter your Frevio Extension API Token (from Settings > Editor Extension)',
        password: true,
        placeHolder: 'frev_live_...',
        ignoreFocusOut: true,
        validateInput: (text: string) => {
          if (!text.trim().startsWith('frev_live_')) {
            return 'Token must start with frev_live_'
          }
          return null
        },
      })

      if (token) {
        await context.secrets.store(TOKEN_SECRET_KEY, token.trim())
        vscode.window.showInformationMessage('Frevio API Token saved securely!')
        await refreshProjectConfig()
      }
    }),

    vscode.commands.registerCommand('frevio.linkProject', async () => {
      const token = await context.secrets.get(TOKEN_SECRET_KEY)
      if (!token) {
        const setNow = await vscode.window.showWarningMessage(
          'Please set your Frevio API Token before linking a project.',
          'Set Token'
        )
        if (setNow === 'Set Token') {
          await vscode.commands.executeCommand('frevio.setToken')
        }
        return
      }

      const workspaceFolder = getWorkspaceFolder()
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('Please open a workspace folder to link with Frevio.')
        return
      }

      const apiBaseUrl = getApiBaseUrl()
      try {
        const res = await fetch(`${apiBaseUrl}/api/extension/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          if (res.status === 401) {
            vscode.window.showErrorMessage('Invalid or expired Frevio API token. Please update your token.')
          } else {
            vscode.window.showErrorMessage(`Failed to load projects: HTTP ${res.status}`)
          }
          return
        }

        const data = (await res.json()) as { projects: Array<{ id: string; project_name: string; client_name: string }> }
        if (!data.projects || data.projects.length === 0) {
          vscode.window.showInformationMessage('No active projects found in Frevio.')
          return
        }

        const items = data.projects.map(p => ({
          label: p.project_name,
          description: `Client: ${p.client_name}`,
          projectId: p.id,
        }))

        const picked = await vscode.window.showQuickPick(items, {
          placeHolder: 'Select the Frevio project to link this workspace with',
        })

        if (picked) {
          const configPath = path.join(workspaceFolder.uri.fsPath, CONFIG_FILENAME)
          const configData: FrevioConfig = {
            projectId: picked.projectId,
            projectName: picked.label,
          }
          fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8')
          currentConfig = configData
          vscode.window.showInformationMessage(`Linked workspace to "${picked.label}"!`)
          updateStatusBar()
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error connecting to Frevio: ${err.message}`)
      }
    }),

    vscode.commands.registerCommand('frevio.unlinkProject', async () => {
      const workspaceFolder = getWorkspaceFolder()
      if (!workspaceFolder) return

      const configPath = path.join(workspaceFolder.uri.fsPath, CONFIG_FILENAME)
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath)
      }
      currentConfig = null
      updateStatusBar()
      vscode.window.showInformationMessage('Unlinked workspace from Frevio.')
    }),

    vscode.commands.registerCommand('frevio.toggleTracking', async () => {
      const wasTracking = !isTrackingPaused
      isTrackingPaused = !isTrackingPaused
      updateStatusBar()

      if (wasTracking && isTrackingPaused) {
        // Just paused: check if session wrap-up prompt should appear
        await checkSessionWrapUpPrompt(context)
      } else {
        vscode.window.showInformationMessage('Frevio tracking resumed.')
      }
    }),

    vscode.commands.registerCommand('frevio.sendUpdate', async () => {
      await promptAndSendUpdate(context, { isWrapUp: false })
    }),

    vscode.commands.registerCommand('frevio.wrapUpSession', async () => {
      isTrackingPaused = true
      updateStatusBar()
      await promptAndSendUpdate(context, { isWrapUp: true })
    }),

    vscode.commands.registerCommand('frevio.openDashboard', () => {
      if (currentConfig?.projectId) {
        const apiBaseUrl = getApiBaseUrl()
        vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`))
      } else {
        vscode.commands.executeCommand('frevio.linkProject')
      }
    }),

    vscode.commands.registerCommand('frevio.showMenu', async () => {
      await showFrevioQuickMenu(context)
    })
  )

  // 4. Track activity events (typing, switching files, saving)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => {
      lastActiveTime = Date.now()
      sessionActivityCount++
    }),
    vscode.window.onDidChangeActiveTextEditor(() => {
      lastActiveTime = Date.now()
      sessionActivityCount++
    }),
    vscode.workspace.onDidSaveTextDocument(() => {
      lastActiveTime = Date.now()
      sessionActivityCount++
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(async () => {
      await refreshProjectConfig()
    })
  )

  // 5. Initialize status & start heartbeat loop
  await refreshProjectConfig()
  startHeartbeatLoop(context)
}

export function deactivate() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
  return vscode.workspace.workspaceFolders?.[0]
}

function getApiBaseUrl(): string {
  const config = vscode.workspace.getConfiguration('frevio')
  let url = config.get<string>('apiBaseUrl', 'https://www.frevio.cloud').trim().replace(/\/+$/, '')
  if (url === 'https://app.frevio.cloud' || url === 'http://app.frevio.cloud') {
    url = 'https://www.frevio.cloud'
  }
  return url
}

function getHeartbeatIntervalSeconds(): number {
  const config = vscode.workspace.getConfiguration('frevio')
  return config.get<number>('heartbeatIntervalSeconds', 120)
}

function getIdleTimeoutMinutes(): number {
  const config = vscode.workspace.getConfiguration('frevio')
  return config.get<number>('idleTimeoutMinutes', 5)
}

function isPromptOnSessionWrapUp(): boolean {
  const config = vscode.workspace.getConfiguration('frevio')
  return config.get<boolean>('promptOnSessionWrapUp', true)
}

async function refreshProjectConfig() {
  const workspaceFolder = getWorkspaceFolder()
  if (!workspaceFolder) {
    currentConfig = null
    updateStatusBar()
    return
  }

  const configPath = path.join(workspaceFolder.uri.fsPath, CONFIG_FILENAME)
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8')
      currentConfig = JSON.parse(content) as FrevioConfig
    } catch {
      currentConfig = null
    }
  } else {
    currentConfig = null
  }
  updateStatusBar()
}

function updateStatusBar() {
  if (!statusBarItem || !sendUpdateStatusBarItem) return

  if (!currentConfig) {
    statusBarItem.text = '$(plug) Frevio: Link Project'
    statusBarItem.tooltip = 'Click to link this workspace with a Frevio project.'
    statusBarItem.command = 'frevio.linkProject'
    statusBarItem.show()
    sendUpdateStatusBarItem.hide()
    return
  }

  // Workspace is linked: Show both primary status item & companion update item
  sendUpdateStatusBarItem.show()

  if (isTrackingPaused) {
    statusBarItem.text = '$(debug-pause) Frevio: Paused'
    statusBarItem.tooltip = `Tracking is paused on "${currentConfig.projectName}". Click for options.`
    statusBarItem.command = 'frevio.showMenu'
    statusBarItem.show()
    return
  }

  const idleTimeoutMs = getIdleTimeoutMinutes() * 60 * 1000
  const isIdle = Date.now() - lastActiveTime > idleTimeoutMs

  if (isIdle) {
    statusBarItem.text = `$(clock) Frevio: ${currentConfig.projectName} (Idle)`
    statusBarItem.tooltip = 'Inactive for > 5 mins. Tracking paused until you type. Click for options.'
  } else {
    statusBarItem.text = `$(pulse) Frevio: ${currentConfig.projectName}`
    statusBarItem.tooltip = `Actively tracking on "${currentConfig.projectName}". Click for options.`
  }

  statusBarItem.command = 'frevio.showMenu'
  statusBarItem.show()
}

async function showFrevioQuickMenu(context: vscode.ExtensionContext) {
  if (!currentConfig) {
    await vscode.commands.executeCommand('frevio.linkProject')
    return
  }

  const trackingLabel = isTrackingPaused ? '$(play) Resume Tracking' : '$(debug-pause) Pause Tracking'
  const trackingDesc = isTrackingPaused ? 'Resume sending active heartbeats' : 'Temporarily stop syncing presence'

  const items: Array<vscode.QuickPickItem & { action: string }> = [
    {
      label: '$(send) Send Update to Client',
      description: 'Post progress bullets & notify client without opening browser',
      action: 'sendUpdate',
    },
    {
      label: '$(sign-out) Wrap Up Coding Session',
      description: 'Pause tracking and draft progress summary for client',
      action: 'wrapUpSession',
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
  ]

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: `Frevio: ${currentConfig.projectName}`,
  })

  if (!picked) return

  switch (picked.action) {
    case 'sendUpdate':
      await vscode.commands.executeCommand('frevio.sendUpdate')
      break
    case 'wrapUpSession':
      await vscode.commands.executeCommand('frevio.wrapUpSession')
      break
    case 'toggleTracking':
      await vscode.commands.executeCommand('frevio.toggleTracking')
      break
    case 'openPortal': {
      const apiBaseUrl = getApiBaseUrl()
      vscode.env.openExternal(vscode.Uri.parse(`${apiBaseUrl}/project/${currentConfig.projectId}`))
      break
    }
    case 'openDashboard':
      await vscode.commands.executeCommand('frevio.openDashboard')
      break
    case 'linkProject':
      await vscode.commands.executeCommand('frevio.linkProject')
      break
    case 'unlinkProject':
      await vscode.commands.executeCommand('frevio.unlinkProject')
      break
    case 'setToken':
      await vscode.commands.executeCommand('frevio.setToken')
      break
  }
}

async function checkSessionWrapUpPrompt(context: vscode.ExtensionContext) {
  if (!currentConfig || !isPromptOnSessionWrapUp() || sessionActivityCount < 3) {
    vscode.window.showInformationMessage('Frevio tracking paused.')
    return
  }

  const choice = await vscode.window.showInformationMessage(
    `Tracking paused. Would you like to send what you completed on "${currentConfig.projectName}" to your client?`,
    'Send Update to Client',
    'Just Pause',
    "Don't Ask Again"
  )

  if (choice === 'Send Update to Client') {
    await promptAndSendUpdate(context, { isWrapUp: true })
  } else if (choice === "Don't Ask Again") {
    const config = vscode.workspace.getConfiguration('frevio')
    await config.update('promptOnSessionWrapUp', false, vscode.ConfigurationTarget.Global)
  }
}

interface UpdateFlowOptions {
  isWrapUp?: boolean
}

async function promptAndSendUpdate(context: vscode.ExtensionContext, options: UpdateFlowOptions = {}) {
  // 1. Verify token
  const token = await context.secrets.get(TOKEN_SECRET_KEY)
  if (!token) {
    const setNow = await vscode.window.showWarningMessage(
      'Please set your Frevio API Token before sending updates.',
      'Set Token'
    )
    if (setNow === 'Set Token') {
      await vscode.commands.executeCommand('frevio.setToken')
    }
    return
  }

  // 2. Verify workspace is linked
  if (!currentConfig) {
    const linkNow = await vscode.window.showWarningMessage(
      'This workspace is not linked to a Frevio project. Link it first to send client updates.',
      'Link Project'
    )
    if (linkNow === 'Link Project') {
      await vscode.commands.executeCommand('frevio.linkProject')
    }
    return
  }

  // 3. Prompt for update bullets
  const prefixTitle = options.isWrapUp ? 'Session Wrap-Up' : 'Client Progress Update'
  const rawBulletsInput = await vscode.window.showInputBox({
    prompt: `[${prefixTitle}] What did you complete on "${currentConfig.projectName}"? (Separate multiple bullets with semicolons or newlines)`,
    placeHolder: 'e.g. Fixed checkout responsive layout; Added automated email test; Updated API endpoints',
    ignoreFocusOut: true,
    validateInput: (text: string) => {
      const items = text.split(/[;\n]/).map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
      if (items.length === 0) {
        return 'Please enter at least one progress bullet point'
      }
      return null
    },
  })

  if (!rawBulletsInput) return

  const bullets = rawBulletsInput
    .split(/[;\n]/)
    .map(s => s.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean)

  if (bullets.length === 0) {
    vscode.window.showWarningMessage('No bullet points were provided. Update was cancelled.')
    return
  }

  // 4. Prompt for optional note/summary
  const noteInput = await vscode.window.showInputBox({
    prompt: `[Optional] Add a summary note for the client (Press Enter to skip)`,
    placeHolder: 'e.g. All daily milestones complete and verified on local environment.',
    ignoreFocusOut: true,
  })

  // 5. Send with progress indicator
  const apiBaseUrl = getApiBaseUrl()

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Sending progress update to ${currentConfig.projectName}...`,
      cancellable: false,
    },
    async progress => {
      progress.report({ increment: 20 })

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
        })

        progress.report({ increment: 70 })

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string }
          if (res.status === 401) {
            vscode.window.showErrorMessage('Invalid Frevio API token. Please update your token in Settings.')
          } else {
            vscode.window.showErrorMessage(
              `Failed to send update: ${errData.error || `HTTP ${res.status}`}`
            )
          }
          return
        }

        const data = (await res.json()) as {
          success: boolean
          projectName: string
          clientName: string
          clientEmail?: string | null
          emailSent: boolean
          portalUrl: string
        }

        // Reset session activity counter since update was posted
        sessionActivityCount = 0

        const emailDetail = data.emailSent
          ? ` (emailed to ${data.clientEmail || 'client'})`
          : ''
        const successMsg = `Progress update sent to ${data.clientName || currentConfig?.projectName}${emailDetail}!`

        const action = await vscode.window.showInformationMessage(
          successMsg,
          'View Client Portal',
          'OK'
        )

        if (action === 'View Client Portal' && data.portalUrl) {
          vscode.env.openExternal(vscode.Uri.parse(data.portalUrl))
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error sending update to Frevio: ${err.message}`)
      }
    }
  )
}

function detectFocusArea(): string {
  const editor = vscode.window.activeTextEditor
  if (!editor) return 'Coding'

  const fileName = editor.document.fileName.toLowerCase()

  if (
    fileName.includes('.test.') ||
    fileName.includes('.spec.') ||
    fileName.includes('/test/') ||
    fileName.includes('/tests/') ||
    fileName.includes('/__tests__/')
  ) {
    return 'Testing & Quality'
  }

  if (
    fileName.endsWith('.tsx') ||
    fileName.endsWith('.jsx') ||
    fileName.endsWith('.vue') ||
    fileName.endsWith('.svelte') ||
    fileName.endsWith('.html') ||
    fileName.endsWith('.css') ||
    fileName.endsWith('.scss') ||
    fileName.includes('/components/') ||
    fileName.includes('/ui/')
  ) {
    return 'Frontend & UI'
  }

  if (
    fileName.includes('/api/') ||
    fileName.includes('/server/') ||
    fileName.endsWith('.sql') ||
    fileName.endsWith('.prisma') ||
    fileName.endsWith('.go') ||
    fileName.endsWith('.rs') ||
    fileName.endsWith('.py')
  ) {
    return 'Backend & API'
  }

  if (fileName.endsWith('.md') || fileName.endsWith('.mdx') || fileName.includes('/docs/')) {
    return 'Documentation'
  }

  return 'Development'
}

function startHeartbeatLoop(context: vscode.ExtensionContext) {
  if (heartbeatTimer) clearInterval(heartbeatTimer)

  const intervalSecs = getHeartbeatIntervalSeconds()
  const intervalMs = intervalSecs * 1000

  heartbeatTimer = setInterval(async () => {
    updateStatusBar()

    if (isTrackingPaused || !currentConfig) return

    const idleTimeoutMs = getIdleTimeoutMinutes() * 60 * 1000
    const timeSinceActive = Date.now() - lastActiveTime

    if (timeSinceActive > idleTimeoutMs) {
      // User is idle, do not send heartbeats
      return
    }

    const token = await context.secrets.get(TOKEN_SECRET_KEY)
    if (!token) return

    const apiBaseUrl = getApiBaseUrl()
    const focusArea = detectFocusArea()

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
      })
    } catch {
      // Silently ignore transient network blips
    }
  }, intervalMs)
}
