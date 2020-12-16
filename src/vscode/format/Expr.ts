import { types } from '../../lisp'
import { ExprFormatter } from './ExprFormatter'
import { SExpr } from './SExpr'
import { State } from './Utils'

export class Expr extends ExprFormatter {
    constructor(state: State) {
        super(state)
    }

    format() {
        const curToken = this.peekToken()
        if (curToken === undefined) {
            return
        }

        switch (curToken.token.type) {
            case types.OPEN_PARENS:
                return this.formatSExpr()
            case types.BACK_QUOTE:
            case types.SINGLE_QUOTE:
                return this.formatQuote()
            case types.POUND_SEQ:
                return this.formatPoundSeq()
            default:
                this.consumeToken()
        }
    }

    formatPoundSeq() {
        // TODO: Need an ExprFormatter to handle setting the space between
        //       the pound sequence and the next thing

        let curToken = this.peekToken()
        const text = curToken?.token.text

        this.consumeToken()

        if (!text?.startsWith('#+') && !text?.startsWith('#-')) {
            return
        }
    }

    formatQuote() {
        const quote = this.peekToken()
        const startPos = this.state.lineLength

        this.consumeToken()

        let curToken = this.peekToken()
        let openCount = 0

        if (quote === undefined || curToken === undefined) {
            return
        }

        if (curToken.token.type !== types.OPEN_PARENS) {
            this.consumeToken()
            return
        }

        while (true) {
            if (curToken === undefined) {
                break
            }

            const diff = curToken.token.start.character - quote.token.start.character
            this.copyExistingWS(curToken, startPos + diff)

            if (curToken?.token.type === types.OPEN_PARENS) {
                openCount += 1
            } else if (curToken?.token.type === types.CLOSE_PARENS) {
                openCount -= 1
                if (openCount === 0) {
                    this.consumeToken()
                    break
                }
            }

            curToken = this.consumeToken()
        }
    }

    formatSExpr() {
        const sexpr = new SExpr(this.state)

        sexpr.format()

        if (sexpr.isMultiline) {
            this.isMultiline = true
        }

        if (sexpr.isOrigML) {
            this.isOrigML = true
        }
    }
}
