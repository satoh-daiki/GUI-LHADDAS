import { BrowserWindow, dialog } from 'electron'
import { Tasks } from '../Tasks'

/**
 * フォルダダイアログからフォルダを選択する
 */
export const openFolderDialog: Tasks['openFileDialog'] = async (defaultPath?: string) => {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    defaultPath,
    properties: ['openDirectory']
  })
  if (result.filePaths.length !== 1) return undefined
  const path = result.filePaths[0]
  if (path === defaultPath) return undefined
  return path
}

/**
 * モックアップ
 */
export const openFolderDialog_mock: Tasks['openFileDialog'] = async () => {
  return await Promise.resolve('/dummy/path')
}
