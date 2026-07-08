import { minValue } from '../../renderer/src/Output'
import { Tasks } from '../Tasks'
import { fileExists } from './fileExists'
import { getLines } from './utils/getLines'

/**
 * LOHDIM-LESの出力データを取得する
 */
export const getOutputLohdimLes2D: Tasks['getOutputLohdimLes2D'] = async (
  path: string,
  nx: number,
  ny: number
) => {
  if (!(await fileExists(path))) return Promise.resolve(null)

  const unit = 'Bq/m²'
  const data = new Float32Array(nx * ny)
  let minNonZero = Infinity
  let maxNonZero = -Infinity
  let i = 0

  const lines = await getLines(path)
  for await (const line of lines) {
    if (i >= nx * ny) break
    const v = Number(line)
    data[i] = v
    if (v > 0) {
      if (v < minNonZero) minNonZero = v
      if (v > maxNonZero) maxNonZero = v
    }
    ++i
  }

  if (minNonZero === Infinity) return Promise.resolve(null)
  minNonZero *= 0.99999 // 最大最小値が[minNonZero, maxNonZero]内に確実に含まれるようにする
  maxNonZero *= 1.00001
  minNonZero = Math.max(minNonZero, minValue)
  maxNonZero = Math.max(maxNonZero, minValue)

  return Promise.resolve({ data, unit, nx, ny, minNonZero, maxNonZero })
}
