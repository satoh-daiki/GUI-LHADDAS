/**
 * 与えられた文字列が数値であれば`true`、そうでなければ`false`を返す
 */
export function isNumeric(text?: string): boolean {
  if (text === undefined) return false
  if (text.trim() === '') return false
  return !isNaN(Number(text))
}

/**
 * 数値⇒ラベル表示用の文字列
 */
export function toString(value?: number): string {
  if (value === undefined) return ''
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs < 1) return value.toExponential(2)
  if (abs < 10) return value.toFixed(2)
  if (abs < 100) return value.toFixed(1)
  return value.toExponential(2)
}
