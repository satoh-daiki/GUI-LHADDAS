import { atom } from 'jotai'
import { atom計算_LohdimLes実行ファイル, atom計算_Sibyl実行ファイル } from './atoms計算タブ'
import { unwrap } from 'jotai/utils'
import { deriv計算_入力 } from './deriv計算_入力'

/**
 * 各種ファイルが存在するかを持つ derived atom
 */
export const deriv計算_exists = unwrap(
  atom(async (get) => {
    const 入力 = get(deriv計算_入力)
    const lohdimLes = await window.tasks.fileExists(get(atom計算_LohdimLes実行ファイル))
    const sibyl = await window.tasks.fileExists(get(atom計算_Sibyl実行ファイル))
    const lohdimLes入力 = 入力?.lohdimLes !== undefined
    const sibyl入力 = 入力?.sibyl !== undefined

    return {
      lohdimLes,
      sibyl,
      lohdimLes入力,
      sibyl入力
    }
  })
)
