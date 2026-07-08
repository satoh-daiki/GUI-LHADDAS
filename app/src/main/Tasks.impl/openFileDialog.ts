import { BrowserWindow, dialog, FileFilter } from 'electron'
import { Tasks } from '../Tasks'

/**
 * ファイルダイアログからファイルを選択する
 */
export const openFileDialog: Tasks['openFileDialog'] = async (
  defaultPath?: string,
  filters?: FileFilter[]
) => {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    defaultPath,
    filters,
    properties: ['openFile']
  })
  if (result.filePaths.length !== 1) return undefined
  const path = result.filePaths[0]
  if (path === defaultPath) return undefined
  return path
}

/**
 * モックアップ
 */
export const openFileDialog_mock: Tasks['openFileDialog'] = async () => {
  return await Promise.resolve('/dummy/path.data')
}
