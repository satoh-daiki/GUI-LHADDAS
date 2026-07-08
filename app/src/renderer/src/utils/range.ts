/**
 * [0, 1, 2, ..., length -1]
 */
export const range = (length: number) => {
  length = Math.max(0, Math.trunc(length))
  const arr = Array(length)
  for (let i = 0; i < length; i++) {
    arr[i] = i
  }
  return arr
}
