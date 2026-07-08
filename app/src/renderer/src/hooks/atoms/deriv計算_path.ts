import { atom } from 'jotai'
import { atom計算_LohdimLes入力フォルダ, atom計算_Sibyl入力フォルダ } from './atoms計算タブ'
import { atomGlobal_tabName } from './atomsGlobal'
import { unwrap } from 'jotai/utils'
import { atomInputRefreshTrigger } from './deriv計算_入力';

/**
 * LOHDIM-LESとSIBYLの出力ファイルパスを返す
 */
export const deriv計算_paths出力 = unwrap(
  atom(async (get) => {
    // 最新のファイル状況をスキャン
    get(atomInputRefreshTrigger);

    const lohdimLes = get(atom計算_LohdimLes入力フォルダ)
    const sibyl = get(atom計算_Sibyl入力フォルダ)
    const tabName = get(atomGlobal_tabName) // タブの切り替え時に読み直す（計算後にファイルが増えているので）
    if (tabName === '計算タブ') return undefined

    return await window.tasks.getOutputPaths(lohdimLes, sibyl)
  })
)
