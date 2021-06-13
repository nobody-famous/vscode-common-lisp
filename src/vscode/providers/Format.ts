import * as vscode from 'vscode'
import { Lexer } from '../../lisp'
import { ExtensionState } from '../Types'
import { Formatter, Options } from '../format/Formatter'

export function getDocumentFormatter(state: ExtensionState): vscode.DocumentFormattingEditProvider {
    return new Provider(state)
}

class Provider implements vscode.DocumentFormattingEditProvider {
    state: ExtensionState

    constructor(state: ExtensionState) {
        this.state = state;
    }

    provideDocumentFormattingEdits(doc: vscode.TextDocument, opts: vscode.FormattingOptions) {
        const lex = new Lexer(doc.getText())
        const tokens = lex.getTokens()
        const formatter = new Formatter(this.readFormatterOptions(), tokens)
        const edits = formatter.format()

        console.log('REPL', this.state.repl);
        return edits.length > 0 ? edits : undefined
    }

    private readFormatterOptions(): Options {
        const cfg = vscode.workspace.getConfiguration('alive')
        const defaults: Options = {
            indentWidth: 2,
            closeParenOwnLine: 'never',
            closeParenStacked: 'always',
            indentCloseParenStack: true,
            maxBlankLines: 1,
        }

        if (cfg?.format === undefined) {
            return defaults
        }

        const indentWidth = cfg.format.indentWidth ?? defaults.indentWidth

        const indentCloseParenStack = cfg.format.indentCloseParenStack ?? defaults.indentCloseParenStack
        const closeParenStacked = cfg.format.closeParenStacked ?? defaults.closeParenStacked
        const closeParenOwnLine = cfg.format.closeParenOwnLine ?? defaults.closeParenOwnLine
        const maxBlankLines = cfg.format.maxBlankLines ?? defaults.maxBlankLines

        return {
            indentWidth,
            indentCloseParenStack,
            closeParenStacked,
            closeParenOwnLine,
            maxBlankLines,
        }
    }
}
