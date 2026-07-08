import { atom, Getter } from 'jotai'
import { atom可視化_timePosition } from './atoms可視化タブ'
import { unwrap } from 'jotai/utils'
import { deriv計算_paths出力 } from './deriv計算_path'
import { deriv計算_入力 } from './deriv計算_入力'
import { Mesh } from '@renderer/Input'
import { TypeOutputFile } from '@renderer/Output'

export const deriv可視化_Data地表沈着濃度Reading = atom(false)
export const deriv可視化_Data大気中濃度Reading = atom(false)
export const deriv可視化_Data線量率Reading = atom(false)

/**
 * 地表沈着濃度データを取得する derived atom
 */
export const deriv可視化_Data地表沈着濃度 = unwrap(
  atom(async (get) => {
    const input = get(deriv計算_入力)
    const path = getPath(get, 'guiGround')
    const mesh: Mesh | undefined = input?.lohdimLes
    if (!path || !mesh) return null
    const { nx, ny } = mesh
    const output = await window.tasks.getOutputLohdimLes2D(path, nx, ny)
    return output
  })
)

/**
 * 大気中濃度データを取得する derived atom
 */
export const deriv可視化_Data大気中濃度 = unwrap(
  atom(async (get) => {
    const input = get(deriv計算_入力)
    const path = getPath(get, 'guiPlume')
    const mesh: Mesh | undefined = input?.lohdimLes
    if (!path || !mesh) return null
    const { nx, ny, nz } = mesh
    const output = await window.tasks.getOutputLohdimLes3D(path, nx, ny, nz)
    return output
  })
)

/**
 * 線量率データを取得する derived atom
 */
export const deriv可視化_Data線量率 = unwrap(
  atom(async (get) => {
    const input = get(deriv計算_入力)
    const path = getPath(get, 'guiDose')
    const mesh: Mesh | undefined = input?.sibyl
    if (!path || !mesh) return null
    const { nx, ny } = mesh
    const output = await window.tasks.getOutputSibyl2D(path, nx, ny)
    return output
  })
)

function getPath(get: Getter, name: TypeOutputFile) {
  const paths = get(deriv計算_paths出力)
  const time = get(atom可視化_timePosition)
  if (!paths) return undefined
  const keys = Object.keys(paths).sort()
  const value = paths[keys[time]]
  if (!value) return undefined
  return value[name]
}
