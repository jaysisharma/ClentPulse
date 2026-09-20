declare module 'vscode' {
  export interface Disposable {
    dispose(): any
  }

  export enum StatusBarAlignment {
    Left = 1,
    Right = 2,
  }

  export interface StatusBarItem extends Disposable {
    alignment: StatusBarAlignment
    priority?: number
    text: string
    tooltip: string
    command: string | undefined
    show(): void
    hide(): void
  }

  export interface QuickPickItem {
    label: string
    description?: string
    detail?: string
    picked?: boolean
  }

  export interface SecretStorage {
    get(key: string): Promise<string | undefined>
    store(key: string, value: string): Promise<void>
    delete(key: string): Promise<void>
  }

  export interface ExtensionContext {
    subscriptions: { push(...items: Disposable[]): void }
    secrets: SecretStorage
  }

  export interface Uri {
    readonly scheme: string
    readonly authority: string
    readonly path: string
    readonly query: string
    readonly fragment: string
    readonly fsPath: string
  }

  export namespace Uri {
    export function parse(value: string, strict?: boolean): Uri
    export function file(path: string): Uri
  }

  export interface WorkspaceFolder {
    readonly uri: Uri
    readonly name: string
    readonly index: number
  }

  export interface TextDocument {
    readonly uri: Uri
    readonly fileName: string
  }

  export interface TextEditor {
    readonly document: TextDocument
  }

  export interface WorkspaceConfiguration {
    get<T>(section: string): T | undefined
    get<T>(section: string, defaultValue: T): T
  }

  export type Event<T> = (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => Disposable

  export namespace window {
    export let activeTextEditor: TextEditor | undefined
    export const onDidChangeActiveTextEditor: Event<TextEditor | undefined>
    export function createStatusBarItem(alignment?: StatusBarAlignment, priority?: number): StatusBarItem
    export function showInputBox(options?: {
      prompt?: string
      password?: boolean
      placeHolder?: string
      value?: string
      validateInput?: (value: string) => string | null | undefined
    }): Promise<string | undefined>
    export function showInformationMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>
    export function showWarningMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>
    export function showErrorMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>
    export function showQuickPick<T extends QuickPickItem>(items: T[], options?: { placeHolder?: string }): Promise<T | undefined>
  }

  export namespace workspace {
    export let workspaceFolders: readonly WorkspaceFolder[] | undefined
    export function getConfiguration(section?: string): WorkspaceConfiguration
    export const onDidChangeTextDocument: Event<any>
    export const onDidSaveTextDocument: Event<TextDocument>
  }

  export namespace commands {
    export function registerCommand(command: string, callback: (...args: any[]) => any, thisArgs?: any): Disposable
    export function executeCommand<T = unknown>(command: string, ...rest: any[]): Promise<T>
  }

  export namespace env {
    export function openExternal(target: Uri): Promise<boolean>
  }
}
