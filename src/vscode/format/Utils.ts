import { Position, Range } from 'vscode'
import { types } from '../../lisp'
import { FormatToken } from './FormatToken'
import { TokenList } from './TokenList'

export interface Options {
    indentWidth: number
    closeParenOwnLine: string
    closeParenStacked: string
    indentCloseParenStack: boolean
    maxBlankLines: number
}

export interface HaveBody {
    [index: string]: boolean
}

export class State {
    range: Range
    indent: number[]
    tokenList: TokenList
    lineLength: number = 0
    haveBody: HaveBody

    options: Options

    constructor(opts: Options, range: Range, indent: number[], tokenList: TokenList, haveBody: HaveBody) {
        this.range = range
        this.indent = indent
        this.tokenList = tokenList
        this.options = opts
        this.haveBody = haveBody
    }
}

export function isExprEnd(curToken: FormatToken | undefined): boolean {
    return curToken === undefined || curToken.token.type === types.CLOSE_PARENS
}

export function inRange(range: Range, pos: types.Position) {
    if (range.start.line > pos.line || range.end.line < pos.line) {
        return false
    } else if (range.start.line < pos.line && range.end.line > pos.line) {
        return true
    } else if (range.start.line === pos.line) {
        return range.start.character <= pos.character
    } else if (range.end.line === pos.line) {
        return range.end.character >= pos.line
    }

    return false
}

export function addToTarget(state: State, token: FormatToken, toAdd: string) {
    if (!inRange(state.range, token.token.start)) {
        return
    }

    token.before.target += toAdd
    state.lineLength += toAdd.length
}

export function setTarget(state: State, token: FormatToken, target: string) {
    const range = state.range

    if (!inRange(range, token.token.start)) {
        token.before.target = token.before.existing
    } else {
        token.before.target = target
    }

    state.lineLength += token.before.target.length
}

export function withIndent(state: State, length: number, fn: () => void) {
    pushNewIndent(state, length)

    try {
        fn()
    } finally {
        state.indent.pop()
    }
}

export function incIndent(state: State, inc: number) {
    const indent = state.indent
    const curIndent = indent[indent.length - 1]

    return curIndent + inc
}

export function withIncIndent(state: State, inc: number, fn: () => void) {
    const newIndent = incIndent(state, inc)

    withIndent(state, newIndent, fn)
}

export function pushNewIndent(state: State, indent: number) {
    state.indent.push(indent)
}

export function countNewLines(text: string): number {
    let count = 0

    for (const ch of text) {
        if (ch === '\n') {
            count += 1
        }
    }

    return count
}
