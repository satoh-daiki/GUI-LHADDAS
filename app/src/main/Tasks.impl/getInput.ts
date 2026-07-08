import { dirname, resolve } from 'path'
import { Input } from '../../renderer/src/Input'
import { Tasks } from '../Tasks'
import { fileExists_mock } from './fileExists'
import { getLines } from './utils/getLines'

/**
 * 入力データを取得する
 */
export const getInput: Tasks['getInput'] = async (
  dir入力LohdimLes: string,
  dir入力Sibyl: string
) => {
  const { pathLohdimLes, pathSibyl } = await getInputFilePath(dir入力LohdimLes, dir入力Sibyl)
  const lohdimLes = await readLohdimLes入力(pathLohdimLes)
  const sibyl = await readSibyl入力(pathSibyl)
  return { lohdimLes, sibyl }
}

// LOHDIM-LES読み込み
export async function readLohdimLes入力(path: string): Promise<Input['lohdimLes'] | undefined> {
  // LOHDIM-LES_input.data
  let bldgTerrainCalc: string | undefined
  let pathBuilding: string | undefined
  let pathElevation: string | undefined
  let pathGrid: string | undefined
  let pathRelease: string | undefined
  let nx: number | undefined
  let ny: number | undefined
  let nz: number | undefined
  let 放出点: { x: number; y: number; z: number } | undefined
  let cellSize: number | undefined
  {
    const lines = await getLines(path)
    let num = 0
    for await (const line of lines) {
      ++num
      if (line.trim() === '' || line[0] === '!') continue
      const split = line.split('!')
      const valueStr = split[0]?.trim()
      if (!valueStr) continue
      if (num === 1) pathBuilding = valueStr.replaceAll(/['"]/g, '')
      if (num === 2) pathElevation = valueStr.replaceAll(/['"]/g, '')
      if (num === 3) pathGrid = valueStr.replaceAll(/['"]/g, '')
      if (num === 4) pathRelease = valueStr.replaceAll(/['"]/g, '')
      if (num === 13) {
        const vals = valueStr.split(',').map(Number)
        if (vals.length !== 3 || vals.some(isNaN)) return undefined
        放出点 = { x: vals[0], y: vals[1], z: vals[2] }
      }
      const value = Number(valueStr)
      if (isNaN(value)) continue
      if (num === 5) nx = value
      if (num === 6) ny = value
      if (num === 7) nz = value
      if (num === 9) bldgTerrainCalc = value;
      if (num === 21) cellSize = value
    }
    if (pathBuilding === undefined) return undefined
    if (pathElevation === undefined) return undefined
    if (pathGrid === undefined) return undefined
    if (pathRelease === undefined) return undefined
    if (nx === undefined || nx <= 0) return undefined
    if (ny === undefined || ny <= 0) return undefined
    if (nz === undefined || nz <= 0) return undefined
    if (放出点 === undefined) return undefined
    if (cellSize === undefined || cellSize <= 0) return undefined
  }

  // zgrid.txt
  const zData: number[] = Array(nz + 1).fill(0)
  {
    let i = 1
    const lines = await getLines(resolve(dirname(path), pathGrid))
    for await (const line of lines) {
      if (i >= zData.length) break
      const val = Number(line)
      if (isNaN(val)) return undefined
      zData[i] = zData[i - 1] + val
      i++
    }
  }

  // ex) Oklahoma.txt
  const buildingData: number[] = Array(nx * ny).fill(0)
  {
    let i = 1
    const lines = await getLines(resolve(dirname(path), pathBuilding))
    for await (const line of lines) {
      if (i >= buildingData.length) break
      const val = Number(line)
      if (isNaN(val)) return undefined
      buildingData[i] = val
      i++
    }
  }

  return {
    bldgTerrainCalc,
    pathBuilding,
    pathElevation,
    pathGrid,
    pathRelease,
    cellSize,
    nx,
    ny,
    nz,
    zData,
    buildingData,
    放出点
  }
}

// SIBYL読み込み
export async function readSibyl入力(path: string): Promise<Input['sibyl'] | undefined> {
  // input.data
  let unit: NonNullable<Input['sibyl']>['unit'] | undefined
  let irs: number | undefined
  let ns_x_sta: number | undefined
  let ns_x_end: number | undefined
  let ns_y_sta: number | undefined
  let ns_y_end: number | undefined
  let ns_z_sta: number | undefined
  let ns_z_end: number | undefined
  let nt_x_sta: number | undefined
  let nt_x_end: number | undefined
  let nt_y_sta: number | undefined
  let nt_y_end: number | undefined
  {
    const lines = await getLines(path)
    for await (const line of lines) {
      if (line.trim() === '' || line[0] === '!') continue
      const split = line.split(' ').filter((s) => s !== '')
      const [key, valueStr] = [split[0], split[2]]
      if (key === 'file') unit = valueStr.includes('_H_') ? 'μSv/h' : 'μGy/h'
      const value = Number(valueStr)
      if (isNaN(value)) continue
      if (key === 'irs') irs = value
      if (key === 'ns_x_sta') ns_x_sta = value
      if (key === 'ns_x_end') ns_x_end = value
      if (key === 'ns_y_sta') ns_y_sta = value
      if (key === 'ns_y_end') ns_y_end = value
      if (key === 'ns_z_sta') ns_z_sta = value
      if (key === 'ns_z_end') ns_z_end = value
      if (key === 'nt_x_sta') nt_x_sta = value
      if (key === 'nt_x_end') nt_x_end = value
      if (key === 'nt_y_sta') nt_y_sta = value
      if (key === 'nt_y_end') nt_y_end = value
    }
    if (unit === undefined) return undefined
    if (irs === undefined || irs <= 0) return undefined
    if (ns_x_sta === undefined) return undefined
    if (ns_x_end === undefined) return undefined
    if (ns_y_sta === undefined) return undefined
    if (ns_y_end === undefined) return undefined
    if (ns_z_sta === undefined) return undefined
    if (ns_z_end === undefined) return undefined
    if (nt_x_sta === undefined) return undefined
    if (nt_x_end === undefined) return undefined
    if (nt_y_sta === undefined) return undefined
    if (nt_y_end === undefined) return undefined
    if (ns_x_end - ns_x_sta <= 0) return undefined
    if (ns_y_end - ns_y_sta <= 0) return undefined
    if (ns_z_end - ns_z_sta <= 0) return undefined
    if (nt_x_end - nt_x_sta <= 0) return undefined
    if (nt_y_end - nt_y_sta <= 0) return undefined
  }

  const nx = ns_x_end - ns_x_sta + 1
  const ny = ns_y_end - ns_y_sta + 1
  const nz = ns_z_end - ns_z_sta

  // Z.data
  const zData: number[] = []
  {
    const lines = await getLines(resolve(dirname(path), 'Z.data'))
    for await (const line of lines) {
      if (line.trim() === '') continue
      const minMax = line
        .split(' ')
        .filter((s) => s !== '')
        .map((s) => Number(s))
      if (minMax.length !== 2 || isNaN(minMax[0]) || isNaN(minMax[1])) return undefined
      if (zData.length === 0) {
        zData.push(minMax[0])
      }
      zData.push(minMax[1])
    }
    if (zData.length <= 1) return undefined
  }

  return {
    unit,
    cellSize: irs,
    nx,
    ny,
    nz,
    sourceX: { min: ns_x_sta, max: ns_x_end },
    sourceY: { min: ns_y_sta, max: ns_y_end },
    sourceZ: { min: ns_z_sta, max: ns_z_end },
    targetX: { min: nt_x_sta, max: nt_x_end },
    targetY: { min: nt_y_sta, max: nt_y_end },
    zData
  }
}

/**
 * 入力フォルダから入力ファイル名を取得する
 */
export async function getInputFilePath(dir入力LohdimLes: string, dir入力Sibyl: string) {
  const pathLohdimLes = dir入力LohdimLes ? resolve(dir入力LohdimLes, 'LOHDIM-LES_input.data') : ''
  const pathSibyl = dir入力Sibyl ? resolve(dir入力Sibyl, 'SIBYL_input.data') : ''
  return { pathLohdimLes, pathSibyl }
}

/**
 * モックアップ
 */
export const getInput_mock: Tasks['getInput'] = async (
  path入力LohdimLes: string,
  path入力Sibyl: string
) => {
  const input: Input = {}
  if (await fileExists_mock(path入力LohdimLes)) {
    input.lohdimLes = path入力LohdimLes.includes('test')
      ? {
          pathBuilding: '',
          pathElevation: '',
          pathGrid: '',
          pathRelease: '',
          cellSize: 50,
          nx: 10,
          ny: 10,
          nz: 10,
          zData: new Array(11).fill(0).map((_, j) => 50 * j),
          buildingData: [],
          放出点: { x: 2, y: 3, z: 5 }
        }
      : {
          pathBuilding: '',
          pathElevation: '',
          pathGrid: '',
          pathRelease: '',
          cellSize: 5,
          nx: 400,
          ny: 400,
          nz: 100,
          zData: new Array(101).fill(0).map((_, j) => 5 * j),
          buildingData: [],
          放出点: { x: 200, y: 200, z: 50 }
        }
  }

  if (await fileExists_mock(path入力Sibyl)) {
    input.sibyl = path入力LohdimLes.includes('test')
      ? {
          unit: 'μSv/h',
          cellSize: 50,
          sourceX: { min: 1, max: 10 },
          sourceY: { min: 1, max: 10 },
          sourceZ: { min: 1, max: 10 },
          zData: new Array(11).fill(0).map((_, j) => 50 * j),
          targetX: { min: 1, max: 7 },
          targetY: { min: 2, max: 8 },
          nx: 10,
          ny: 10,
          nz: 10
        }
      : {
          unit: 'μGy/h',
          cellSize: 10,
          sourceX: { min: 1, max: 400 },
          sourceY: { min: 1, max: 400 },
          sourceZ: { min: 1, max: 100 },
          zData: new Array(101).fill(0).map((_, j) => 5 * j),
          targetX: { min: 50, max: 350 },
          targetY: { min: 50, max: 350 },
          nx: 10,
          ny: 10,
          nz: 10
        }
  }

  return input
}
