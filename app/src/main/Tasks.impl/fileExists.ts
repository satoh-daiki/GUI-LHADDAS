import { access } from 'fs/promises'
import { Tasks } from '../Tasks'

/**
 * ファイル／フォルダが存在するかを返す
 */
export const fileExists: Tasks['fileExists'] = async (path: string) => {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * モックアップ
 */
export const fileExists_mock: Tasks['fileExists'] = async (path: string) => {
  return await Promise.resolve(path !== '')
}
