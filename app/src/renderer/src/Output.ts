export type Range = { min: number; max: number }

/**
 * 2次元データ data[nx * iy + ix]
 */
export interface Output2D {
  data: Float32Array
  unit: string
  nx: number
  ny: number
  minNonZero: number
  maxNonZero: number
}

/**
 * 3次元データ data[nz * ny * ix + nz * iy + iz]
 */
export interface Output3D {
  data: Float32Array
  nx: number
  ny: number
  nz: number
  minNonZero: number
  maxNonZero: number
}

/**
 * 出力ファイルのうち必要なもの
 */
export type TypeOutputFile = 'sibylGround' | 'sibylPlume' | 'guiGround' | 'guiPlume' | 'guiDose'

/**
 * 3次元データの値がこの値より小さい場合、この値で置き換える。
 * 統一性のため2次元データの下限もこれを採用する。
 * （floatの最小値 1.17549435E-38 以下だと-infinityになって表示がおかしくなる問題への対応。）
 */
export const minValue = 1e-30
