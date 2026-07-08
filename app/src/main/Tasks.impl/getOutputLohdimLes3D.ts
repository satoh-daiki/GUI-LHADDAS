import { minValue } from '../../renderer/src/Output'
import { Tasks } from '../Tasks'
import { fileExists } from './fileExists'
import { getLines } from './utils/getLines'

/**
 * LOHDIM-LESの出力データを取得する
 */
export const getOutputLohdimLes3D: Tasks['getOutputLohdimLes3D'] = async (
  path: string,
  nx: number,
  ny: number,
  nz: number
) => {
  if (!(await fileExists(path))) return Promise.resolve(null)

  const data = new Float32Array(nx * ny * nz)
  let minNonZero = Infinity
  let maxNonZero = -Infinity
  let i = 0

  const lines = await getLines(path)
  for await (const line of lines) {
    if (i >= nx * ny * nz) break
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

  return Promise.resolve({ data, nx, ny, nz, minNonZero, maxNonZero })
}

/**
 * モックアップ
 */
export const getOutputLohdimLes3D_Mock: Tasks['getOutputLohdimLes3D'] = async (
  _path: string,
  nx: number,
  ny: number,
  nz: number
) => {
  const data = new Float32Array(nx * ny * nz)
  let minNonZero = Infinity
  let maxNonZero = -Infinity

  let i = 0
  for (let iz = 0; iz < nz; iz++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const xx = ix / (nx - 1)
        const yy = iy / (ny - 1)
        const zz = iz / (nz - 1)
        const isTerrain =
          1.0 ===
          Math.floor((Math.sin(xx * 2 * Math.PI) * Math.sin(yy * 4 * Math.PI)) / 4 + 1.25 - zz)
        if (isTerrain) {
          data[i] = -1
        } else {
          const v = Math.pow(
            Math.sin(xx * 2 * Math.PI) *
              Math.sin(yy * 3 * Math.PI) *
              Math.cos((zz - 0.5) * 2 * Math.PI),
            2
          )
          data[i] = v
          if (v > 0) {
            if (v < minNonZero) minNonZero = v
            if (v > maxNonZero) maxNonZero = v
          }
        }
        ++i
      }
    }
  }
  if (minNonZero === Infinity) return Promise.resolve(null)
  minNonZero *= 0.99999 // 最大最小値が[minNonZero, maxNonZero]内に確実に含まれるようにする
  maxNonZero *= 1.00001

  return { data, nx, ny, nz, minNonZero, maxNonZero }
}
