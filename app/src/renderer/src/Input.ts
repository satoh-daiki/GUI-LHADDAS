export type Range = { min: number; max: number }

export interface Mesh {
  cellSize: number
  nx: number
  ny: number
  nz: number
  zData: number[] // zData.length === nz + 1
}

/**
 * LOHDIM-LESとSIBYLの入力ファイルから得られる情報
 */
export interface Input {
  lohdimLes?: {
    pathBuilding: string
    pathElevation: string
    pathGrid: string
    pathRelease: string
    buildingData: number[] // buildingData.length === nx * ny
    放出点: { x: number; y: number; z: number }
  } & Mesh
  sibyl?: {
    unit: 'μSv/h' | 'μGy/h'
    sourceX: Range
    sourceY: Range
    sourceZ: Range
    targetX: Range
    targetY: Range
  } & Mesh
}
