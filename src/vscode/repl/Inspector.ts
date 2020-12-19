import { EventEmitter } from 'events'
import * as path from 'path'
import * as vscode from 'vscode'
import { unescape } from '../../lisp'
import { InspectContent, InspectContentAction } from '../../swank/Types'

export class Inspector extends EventEmitter {
    ctx: vscode.ExtensionContext
    id: number
    title: string
    content: InspectContent
    viewCol: vscode.ViewColumn
    panel?: vscode.WebviewPanel

    constructor(ctx: vscode.ExtensionContext, id: number, title: string, content: InspectContent, viewCol: vscode.ViewColumn) {
        super()

        this.ctx = ctx
        this.id = id
        this.title = title
        this.content = content
        this.viewCol = viewCol
    }

    run() {
        if (this.panel !== undefined) {
            vscode.window.showInformationMessage('Inspector panel already exists')
            return
        }

        const type = `cl-inspector`

        this.panel = vscode.window.createWebviewPanel(type, this.title, this.viewCol, { enableScripts: true })

        this.renderHtml()
    }

    stop() {
        this.panel?.dispose()
        this.panel = undefined
    }

    private renderAction(item: InspectContentAction) {
        const display = this.escapeHtml(unescape(item.display))
        const actName = item.action.toUpperCase()
        let btnClass = ''
        let str = ''

        if (actName === 'ACTION') {
            btnClass = 'inspect-btn-action'
        } else if (actName === 'VALUE') {
            btnClass = 'inspect-btn-value'
        }

        str += `
            <div class="inspect-action-box">
                <button class="${btnClass}">${display}</button>
            </div>
        `

        return str
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
                str += this.renderAction(item)
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
