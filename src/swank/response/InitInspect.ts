import { Expr, exprToNumber, exprToString, SExpr } from '../../lisp'
import { Return } from '../event'
import { convert } from '../SwankUtils'

interface ContentAction {
    action: string
    display: string
    index: number
}

interface Content {
    display: Array<ContentAction | string>
}

export class InitInspect {
    static parse(event: Return): InitInspect | undefined {
        if (event.info.status !== ':OK') {
            return undefined
        }

        const payload = event.info.payload

        if (!(payload instanceof SExpr)) {
            return undefined
        }

        const obj = this.parsePayload(payload.parts)

        return undefined
    }

    static parsePayload(payload: Expr[]) {
        for (let ndx = 0; ndx < payload.length; ndx += 2) {
            const key = payload[ndx]
            const value = payload[ndx + 1]

            if (key === undefined || value === undefined) {
                break
            }

            const name = exprToString(key)?.toUpperCase()

            if (name === ':TITLE') {
                const title = exprToString(value)

                if (title !== undefined) {
                    console.log('title', title)
                }
            } else if (name === ':ID') {
                const id = exprToNumber(value)

                if (id !== undefined) {
                    console.log('id', id)
                }
            } else if (name === ':CONTENT') {
                if (value instanceof SExpr) {
                    this.parseContent(value.parts)
                }
            } else {
                console.log('key', name)
                console.log('value', value)
            }
        }
    }

    static parseContent(exprs: Expr[]) {
        if (exprs.length !== 4) {
            return
        }

        const display = this.parseDisplay(exprs[0])
        const num1 = exprToNumber(exprs[1])
        const num2 = exprToNumber(exprs[2])
        const num3 = exprToNumber(exprs[3])

        console.log('nums', num1, num2, num3)
    }

    static parseDisplay(expr: Expr): Array<string | ContentAction> | undefined {
        if (!(expr instanceof SExpr)) {
            return
        }

        let display = ''
        const result: Array<string | ContentAction> = []
        let actions: string[] = []

        for (const part of expr.parts) {
            const str = exprToString(part)

            if (str !== undefined) {
                const converted = convert(str)

                if (converted === '\n') {
                    result.push(display)
                    result.push(...actions)

                    display = ''
                    actions = []
                } else {
                    display += convert(str)
                }
            } else {
                actions.push('ACTION')
            }
        }

        console.log(result)
    }
}
