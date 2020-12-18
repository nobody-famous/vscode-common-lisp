import { EventEmitter } from 'events'
import { type } from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { InspectContent } from '../../swank/Types'

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

    renderContent() {
        let str = ''

        for (const item of this.content.display) {
            if (typeof item === 'string') {
                str += `<div>${item}</div>`
            }
        }

        return str
    }

    renderHtml() {
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
                    <div class="inspect-title">${this.title}</div>
                    <hr></hr>
                    <div class="inspect-content">${this.renderContent()}</div>
                </div>

                <script src="${this.panel?.webview.asWebviewUri(jsPath)}"></script>
            </body>
            </html>
        `
    }
}
