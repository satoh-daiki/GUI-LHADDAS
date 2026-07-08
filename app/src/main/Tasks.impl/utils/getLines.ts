import { createInterface } from 'readline'
import { fileExists } from '../fileExists'
import { createReadStream } from 'fs'

/**
 * 各行を取得するイテレータを返す。
 * 読み込み失敗時は`[]`を返す。
 */
export async function getLines(path: string) {
  if (!(await fileExists(path))) return []
  return createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity
  })
}
