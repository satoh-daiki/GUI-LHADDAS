import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

/**
 * 計算実行中
 */
export const atomGlobal_is計算中 = atom(false)

/**
 * 大気中濃度読込み中
 */
export const atomGlobal_is読込み中 = atom(false)

/**
 * 選択されているタブ
 */
export const atomGlobal_tabName = atom<'設定タブ' | '可視化タブ'>('設定タブ')

/**
 * プラットフォーム名（win32, ...）
 */
export const atomGlobal_platform = unwrap(atom(async () => await window.tasks.getPlatform()))

/**
 * 地図設定の開閉
 */
export const atomGlobal_open地図設定 = atom(true)

/**
 * 警告表示の内容
 */
export const atomGlobal_snackbar = atom<string>()
