export function fixTwoDecimal(num: number, fixNumber: number = 2) {
    return parseFloat(num.toFixed(fixNumber))
}