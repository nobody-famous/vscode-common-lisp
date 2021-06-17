import { EOL } from 'os'
import { types } from '../../lisp'
import { Expr } from './Expr'
import { ExprFormatter } from './ExprFormatter'
import { countNewLines, setTarget, State } from './Utils'

export class RootExpr extends ExprFormatter {
    constructor(state: State) {
        super(state)
    }

    format() {
        let curToken = this.peekToken()

        if (curToken !== undefined) {
            setTarget(this.state, curToken, '')
        }

        while (curToken !== undefined) {
            const expr = new Expr(this.state)

            expr.isTopLevel = true
            expr.format()

            curToken = this.peekToken()
            if (curToken === undefined) {
                break
            }

            const prev = this.prevToken()

            if (curToken.token.type !== types.COMMENT && prev?.token.type !== types.COMMENT) {
                const count = countNewLines(curToken.before.existing)

                if (count <= 1) {
                    setTarget(this.state, curToken, `${EOL}`)
                } else {
                    const cfg = this.state.options.maxBlankLines + 1
                    const blanks = Math.min(cfg, count)

                    setTarget(this.state, curToken, `${EOL}`.repeat(blanks))
                }

                this.state.lineLength = 0
            } else {
                this.copyExistingWS(curToken)
            }
        }
    }
}
