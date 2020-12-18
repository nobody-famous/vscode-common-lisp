import { EventEmitter } from 'events'
import * as path from 'path'
import * as vscode from 'vscode'
import { unescape } from '../../lisp'
import { convert } from '../../swank/SwankUtils'
import { InspectContent, InspectContentAction } from '../../swank/Types'

export class Inspector extends EventEmitter {
    ctx: vscode.ExtensionContext
    title: string
    content: InspectContent
    viewCol: vscode.ViewColumn
    panel?: vscode.WebviewPanel

    constructor(ctx: vscode.ExtensionContext, title: string, content: InspectContent, viewCol: vscode.ViewColumn) {
        super()

        this.ctx = ctx
        this.title = title
        this.content = content
        this.viewCol = viewCol
    }

    run() {
        if (this.panel !== undefined) {
            vscode.window.showInformationMessage('Inspector panel already exists')
            return
        }

        this.panel = vscode.window.createWebviewPanel('cl-inspector', this.title, this.viewCol, { enableScripts: true })

        this.renderHtml()
    }

    stop() {
        this.panel?.dispose()
        this.panel = undefined
    }

    private renderContent() {
        const display = this.content.display
        let str = ''
        let opened = false

        for (const item of display) {
            if (typeof item === 'string') {
                if (opened) {
                    str += '</div>'
                    opened = false
                }

                opened = true

                str += `<div class="inspect-item">`
                str += item
            } else if ('display' in item) {
                str += this.escapeHtml(unescape(item.display))
            }
        }

        return str
    }

    private escapeHtml(text: string) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#39;')
    }

    private renderHtml() {
        if (this.panel === undefined) {
            vscode.window.showInformationMessage('Panel not undefined')
            return
        }

        const jsPath = vscode.Uri.file(path.join(this.ctx.extensionPath, 'resource', 'inspector', 'inspect.js'))
        const cssPath = vscode.Uri.file(path.join(this.ctx.extensionPath, 'resource', 'inspector', 'inspect.css'))

        this.panel.webview.html = `
            <html>
            <head>
                <link rel="stylesheet" href="${this.panel?.webview.asWebviewUri(cssPath)}">
            </head>
            <body>
                <div id="content">
                    <div class="inspect-title">${this.escapeHtml(this.title)}</div>
                    <hr></hr>
                    <div class="inspect-content">${this.renderContent()}</div>
                </div>

                <script src="${this.panel?.webview.asWebviewUri(jsPath)}"></script>
            </body>
            </html>
        `
    }
}
