declare const __html__: string

interface RGB {
  readonly r: number
  readonly g: number
  readonly b: number
}

interface RGBA {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

interface FontName {
  readonly family: string
  readonly style: string
}

interface BaseNode {
  readonly id: string
  readonly parent: (BaseNode & ChildrenMixin) | null
  name: string
  readonly removed: boolean
  toString(): string
}

interface LayoutMixin {
  x: number
  y: number
  readonly width: number
  readonly height: number
  rotation: number
  resize(width: number, height: number): void
}

interface ChildrenMixin {
  readonly children: ReadonlyArray<SceneNode>
  appendChild(child: SceneNode): void
  insertChild(index: number, child: SceneNode): void
}

interface ExportSettingsImage {
  readonly format: 'PNG' | 'JPG' | 'SVG' | 'PDF'
  readonly constraint?: {
    readonly type: 'SCALE' | 'WIDTH' | 'HEIGHT'
    readonly value: number
  }
}

interface ExportMixin {
  exportAsync(settings?: ExportSettingsImage): Promise<Uint8Array>
}

interface SceneNodeMixin {
  visible: boolean
  locked: boolean
}

type SceneNode = BaseNode & SceneNodeMixin & LayoutMixin & ExportMixin & any

interface PageNode extends BaseNode, ChildrenMixin {
  selection: ReadonlyArray<SceneNode>
  name: string
}

interface StickyNode extends BaseNode, SceneNodeMixin, LayoutMixin {
  readonly type: 'STICKY'
  text: { characters: string }
  authorVisible: boolean
  authorName: string
}

interface TextNode extends BaseNode, SceneNodeMixin, LayoutMixin {
  readonly type: 'TEXT'
  characters: string
  fontSize: number | any
  fontName: FontName | any
  fills: ReadonlyArray<any>
}

interface FrameNode extends BaseNode, SceneNodeMixin, LayoutMixin, ChildrenMixin, ExportMixin {
  readonly type: 'FRAME'
  cornerRadius: number | any
  fills: ReadonlyArray<any>
  strokes: ReadonlyArray<any>
  strokeWeight: number
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
  itemSpacing: number
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  primaryAxisSizingMode: 'FIXED' | 'AUTO'
  counterAxisSizingMode: 'FIXED' | 'AUTO'
}

interface PluginAPI {
  readonly root: { name: string }
  currentPage: PageNode
  readonly viewport: {
    readonly center: { x: number; y: number }
    scrollAndZoomIntoView(nodes: ReadonlyArray<SceneNode>): void
  }
  showUI(html: string, options?: { width?: number; height?: number; themeColors?: boolean; title?: string }): void
  readonly ui: {
    postMessage(pluginMessage: any, options?: any): void
    onmessage: ((pluginMessage: any) => void) | undefined
    close(): void
  }
  notify(message: string, options?: { timeout?: number; error?: boolean }): void
  closePlugin(message?: string): void
  on(type: 'selectionchange' | 'currentpagechange' | 'close', callback: () => void): void
  readonly clientStorage: {
    getAsync(key: string): Promise<any>
    setAsync(key: string, value: any): Promise<void>
    deleteAsync(key: string): Promise<void>
  }
  loadFontAsync(fontName: FontName): Promise<void>
  createSticky?(): StickyNode
  createFrame(): FrameNode
  createText(): TextNode
  group(nodes: ReadonlyArray<SceneNode>, parent: BaseNode & ChildrenMixin, index?: number): any
}

declare const figma: PluginAPI
