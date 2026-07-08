import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

/**
 * LOHDIM-LESの実行ファイルパス
 */
export const atom計算_LohdimLes実行ファイル = atomWithStorage('LOHDIM-LES binary', '')

/**
 * SIBYLの実行ファイルパス
 */
export const atom計算_Sibyl実行ファイル = atomWithStorage('SIBYL binary', '')

/**
 * LOHDIM-LESの入力ファイルパス
 */
export const atom計算_LohdimLes入力フォルダ = atom('')

/**
 * SIBYLの入力ファイルパス
 */
export const atom計算_Sibyl入力フォルダ = atom('')

/**
 * LOHDIM-LESを実行するか
 */
export const atom計算_LohdimLes有効 = atom(true)

/**
 * SIBYLを実行するか
 */
export const atom計算_Sibyl有効 = atom(true)

/**
 * 計算進捗を管理する 
 */
export const atom計算進捗_現在 = atom(0);
export const atom計算進捗_合計 = atom(0);
