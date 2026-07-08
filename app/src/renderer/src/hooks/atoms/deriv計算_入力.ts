import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'
import { atom計算_LohdimLes入力フォルダ, atom計算_Sibyl入力フォルダ } from './atoms計算タブ'

/**
 * 入力ファイル情報を持つ derived atom
 */
export const deriv計算_入力 = unwrap(
  atom(async (get) => {
    const lohdimLes = get(atom計算_LohdimLes入力フォルダ);
    const sibyl = get(atom計算_Sibyl入力フォルダ);
    get(atomInputRefreshTrigger); 

    const input = await window.tasks.getInput(lohdimLes, sibyl);
    return input;
  })
);

export const atomInputRefreshTrigger = atom(0);
