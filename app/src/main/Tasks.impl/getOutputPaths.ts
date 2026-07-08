import { resolve } from 'path'
import { Tasks } from '../Tasks'
import { readdir } from 'fs/promises'
import { fileExists } from './fileExists'
import { TypeOutputFile } from '../../renderer/src/Output'

type TypeReturn = Awaited<ReturnType<Tasks['getOutputPaths']>>

/**
 * 出力ファイル一覧を取得する
 */
export const getOutputPaths: Tasks['getOutputPaths'] = async (
  dir入力LohdimLes: string,
  dir入力Sibyl: string
) => {
  const regexSibylGround = /SIBYL_GROUND_(\d\d\d)\.data$/
  const regexSibylPlume = /SIBYL_PLUME_(\d\d\d)\.data$/
  const regexGuiGround = /GUI_GROUND_(\d\d\d)\.data$/
  const regexGuiPlume = /GUI_PLUME_(\d\d\d)\.data$/
  const regexGuiDose = /GUI_DOSE_(\d\d\d)\.data$/
  const sibylGround = await getPaths(dir入力Sibyl, regexSibylGround)
  const sibylPlume = await getPaths(dir入力Sibyl, regexSibylPlume)
  const guiGround = await getPaths(dir入力LohdimLes, regexGuiGround)
  const guiPlume = await getPaths(dir入力LohdimLes, regexGuiPlume)
  const guiDose = await getPaths(dir入力Sibyl, regexGuiDose)
  const nums: TypeReturn = {}
  add('sibylGround', sibylGround, regexSibylGround)
  add('sibylPlume', sibylPlume, regexSibylPlume)
  add('guiGround', guiGround, regexGuiGround)
  add('guiPlume', guiPlume, regexGuiPlume)
  add('guiDose', guiDose, regexGuiDose)
  return nums

  // ローカル関数
  function add(type: TypeOutputFile, paths: string[], filter: RegExp) {
    for (const path of paths) {
      const key = filter.exec(path)?.at(1)
      if (key === undefined) continue
      if (!(key in nums)) {
        nums[key] = {}
      }
      nums[key][type] = path
    }
  }
}

/**
 * `dir`内のファイルのうち、`filter`にマッチするものを返す
 */
async function getPaths(dir: string, filter: RegExp): Promise<string[]> {
  if (!(await fileExists(dir))) return []
  return (await readdir(dir)).filter((f) => f.match(filter)).map((f) => resolve(dir, f))
}
