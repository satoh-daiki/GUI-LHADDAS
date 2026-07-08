import { atom } from 'jotai'
import {
  atom計算_LohdimLes入力フォルダ,
  atom計算_LohdimLes有効,
  atom計算_Sibyl入力フォルダ,
  atom計算_Sibyl有効
} from './atoms計算タブ'
import { deriv計算_exists } from './deriv計算_exists'

/**
 * 計算タブ自体をクリックして開けるかどうか
 * 条件: LOHDIM または SIBYL のいずれかの入力フォルダが設定されていればOK
 */
export const deriv計算_isTabEnabled = atom((get) => {
  const lohdimFolder = get(atom計算_LohdimLes入力フォルダ)
  const sibylFolder = get(atom計算_Sibyl入力フォルダ)

  // どちらか一方でも空文字でなければタブを解放
  return (lohdimFolder !== '') || (sibylFolder !== '')
})

/**
 * 計算開始ボタンを押せるかどうかを持つ derived atom
 */
export const deriv計算_is計算可能 = atom((get) => {
  const lohdimLes有効 = get(atom計算_LohdimLes有効)
  const sibyl有効 = get(atom計算_Sibyl有効)
  const exists = get(deriv計算_exists)
  const lohdimLes = get(atom計算_LohdimLes入力フォルダ)
  const sibyl = get(atom計算_Sibyl入力フォルダ)

  const is計算可能 =
    // どちらかは選択されている
    (lohdimLes有効 || sibyl有効) &&
    // 大気拡散のパラメータはOK
    (!lohdimLes有効 || (exists?.lohdimLes && lohdimLes)) &&
    // 線量評価のパラメータはOK
    (!sibyl有効 || (exists?.sibyl && sibyl))

  return is計算可能
})

