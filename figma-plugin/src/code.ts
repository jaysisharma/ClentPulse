// Frevio Figma Plugin — Background Sandbox Script

figma.showUI(__html__, {
  width: 380,
  height: 620,
  themeColors: true,
  title: 'Frevio',
})

// Convert Uint8Array to base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // In Figma sandbox, btoa may or may not be globally defined, so we implement standard base64 encoding safely
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let base64 = ''
  let i = 0
  while (i < len) {
    const b1 = bytes[i++]
    const b2 = i < len ? bytes[i++] : NaN
    const b3 = i < len ? bytes[i++] : NaN

    const e1 = b1 >> 2
    const e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
    let e3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
    let e4 = isNaN(b3) ? 64 : b3 & 63

    base64 += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
  }
  return base64
}

function getSelectionData() {
  const selection = figma.currentPage.selection
  if (!selection || selection.length === 0) {
    return null
  }
  const node = selection[0]
  return {
    id: node.id,
    name: node.name || 'Untitled Frame',
    type: node.type,
    width: Math.round(node.width || 0),
    height: Math.round(node.height || 0),
  }
}

async function sendInitialData() {
  const token = await figma.clientStorage.getAsync('frevio_token')
  const projectId = await figma.clientStorage.getAsync('frevio_project_id')
  const projectName = await figma.clientStorage.getAsync('frevio_project_name')
  const clientName = await figma.clientStorage.getAsync('frevio_client_name')
  const apiBaseUrl = await figma.clientStorage.getAsync('frevio_api_url')
  const isPaused = await figma.clientStorage.getAsync('frevio_tracking_paused')

  figma.ui.postMessage({
    type: 'init-data',
    fileName: figma.root.name || 'Untitled Design',
    pageName: figma.currentPage.name || 'Page 1',
    selection: getSelectionData(),
    storedConfig: {
      token: token || '',
      projectId: projectId || '',
      projectName: projectName || '',
      clientName: clientName || '',
      apiBaseUrl: apiBaseUrl || 'https://www.frevio.cloud',
      isPaused: Boolean(isPaused),
    },
  })
}

// Send init info when UI opens
sendInitialData()

// Listen to selection changes on the Figma canvas
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'selection-change',
    selection: getSelectionData(),
  })
})

// Listen to page switch
figma.on('currentpagechange', () => {
  figma.ui.postMessage({
    type: 'page-change',
    pageName: figma.currentPage.name || 'Page 1',
    selection: getSelectionData(),
  })
})

// Handle commands sent from UI iframe
figma.ui.onmessage = async (msg: any) => {
  if (!msg || typeof msg !== 'object') return

  switch (msg.type) {
    case 'save-settings': {
      if (msg.token !== undefined) await figma.clientStorage.setAsync('frevio_token', msg.token)
      if (msg.projectId !== undefined) await figma.clientStorage.setAsync('frevio_project_id', msg.projectId)
      if (msg.projectName !== undefined) await figma.clientStorage.setAsync('frevio_project_name', msg.projectName)
      if (msg.clientName !== undefined) await figma.clientStorage.setAsync('frevio_client_name', msg.clientName)
      if (msg.apiBaseUrl !== undefined) await figma.clientStorage.setAsync('frevio_api_url', msg.apiBaseUrl)
      if (msg.isPaused !== undefined) await figma.clientStorage.setAsync('frevio_tracking_paused', msg.isPaused)
      break
    }

    case 'export-frame': {
      const selection = figma.currentPage.selection
      if (!selection || selection.length === 0) {
        figma.notify('⚠️ Please select a frame or component to export.', { error: true })
        figma.ui.postMessage({ type: 'export-error', error: 'No node selected' })
        return
      }

      const node = selection[0]
      try {
        const bytes = await node.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 2 },
        })
        const base64 = uint8ArrayToBase64(bytes)
        figma.ui.postMessage({
          type: 'frame-exported',
          imageBase64: base64,
          frameName: node.name,
          width: Math.round(node.width),
          height: Math.round(node.height),
        })
      } catch (err: any) {
        figma.notify(`Export failed: ${err.message}`, { error: true })
        figma.ui.postMessage({ type: 'export-error', error: err.message })
      }
      break
    }

    case 'pin-feedback': {
      const items = Array.isArray(msg.feedback) ? msg.feedback : []
      if (items.length === 0) {
        figma.notify('No feedback comments to pin.')
        return
      }

      try {
        // Load fonts for text rendering
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
        await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
        await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })

        const selection = figma.currentPage.selection
        const referenceNode = selection && selection.length > 0 ? selection[0] : null

        let startX = referenceNode ? referenceNode.x + referenceNode.width + 48 : figma.viewport.center.x - 140
        let startY = referenceNode ? referenceNode.y : figma.viewport.center.y - (items.length * 90)

        const createdNodes: SceneNode[] = []

        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const isRevision = item.type === 'revision_request'

          // Create container card frame
          const card = figma.createFrame()
          card.name = `[Client Feedback] ${item.author || 'Client'}`
          card.resize(320, 150)
          card.x = startX
          card.y = startY + i * 180
          card.cornerRadius = 12

          // Background fill
          card.fills = [
            {
              type: 'SOLID',
              color: isRevision ? { r: 0.99, g: 0.95, b: 0.93 } : { r: 0.95, g: 0.96, b: 0.99 },
            },
          ]

          // Border stroke
          card.strokes = [
            {
              type: 'SOLID',
              color: isRevision ? { r: 0.98, g: 0.45, b: 0.35 } : { r: 0.49, g: 0.54, b: 0.95 },
            },
          ]
          card.strokeWeight = 1.5

          // Layout setup (Auto Layout vertical)
          card.layoutMode = 'VERTICAL'
          card.primaryAxisSizingMode = 'AUTO'
          card.counterAxisSizingMode = 'FIXED'
          card.paddingLeft = 16
          card.paddingRight = 16
          card.paddingTop = 14
          card.paddingBottom = 16
          card.itemSpacing = 8

          // Header tag text
          const tagText = figma.createText()
          tagText.fontName = { family: 'Inter', style: 'Bold' }
          tagText.fontSize = 11
          tagText.characters = isRevision ? '⚠️ REVISION REQUEST' : '💬 CLIENT COMMENT'
          tagText.fills = [
            {
              type: 'SOLID',
              color: isRevision ? { r: 0.85, g: 0.25, b: 0.15 } : { r: 0.25, g: 0.35, b: 0.85 },
            },
          ]
          card.appendChild(tagText)

          // Body comment text
          const bodyText = figma.createText()
          bodyText.fontName = { family: 'Inter', style: 'Regular' }
          bodyText.fontSize = 13
          bodyText.characters = item.text || '(No comment text provided)'
          bodyText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.12, b: 0.16 } }]
          bodyText.resize(288, bodyText.height)
          card.appendChild(bodyText)

          // Author / Date footer text
          const footerText = figma.createText()
          footerText.fontName = { family: 'Inter', style: 'Medium' }
          footerText.fontSize = 11
          const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'
          footerText.characters = `— ${item.author || 'Client'} · ${dateStr}`
          footerText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.5, b: 0.58 } }]
          card.appendChild(footerText)

          figma.currentPage.appendChild(card)
          createdNodes.push(card)
        }

        figma.currentPage.selection = createdNodes
        figma.viewport.scrollAndZoomIntoView(createdNodes)
        figma.notify(`📌 Pinned ${items.length} client feedback note${items.length === 1 ? '' : 's'} to canvas!`)
      } catch (err: any) {
        figma.notify(`Could not pin notes: ${err.message}`, { error: true })
      }
      break
    }

    case 'notify': {
      if (msg.message) {
        figma.notify(msg.message, { error: Boolean(msg.error) })
      }
      break
    }

    case 'close': {
      figma.closePlugin()
      break
    }
  }
}

