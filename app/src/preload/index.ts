import { contextBridge, ipcRenderer } from 'electron'
import { getApiTasks } from '../main/Tasks'
const path = require('path')

import { pathToFileURL } from 'url'

// renderer側で`await window.tasks.xxx()`を呼ぶとここで登録された関数が呼ばれる。
// ただし、ここから直接Electronの機能は呼べないので、IPC (プロセス間通信)の設定を`main/Tasks.ts, ipcRegister()`で行っている。
// https://www.electronjs.org/ja/docs/latest/tutorial/tutorial-preload#プロセス間通信

contextBridge.exposeInMainWorld('tasks', getApiTasks())
const isDev = process.env.NODE_ENV === 'development'

function toDirFileUrl(dirPath: string) {
  // 末尾に区切りがないと相対解決がズレるので必ず付与
  const withSep = dirPath.endsWith(path.sep) ? dirPath : dirPath + path.sep
  return pathToFileURL(withSep).toString()
}

contextBridge.exposeInMainWorld('paths', {
  cesiumBaseUrl: isDev
    ? '/cesium/' // dev server で公開される想定
    : toDirFileUrl(path.join(process.resourcesPath, 'cesium')),
  // packaged では app.asar 内の相対パスは使えないため、resources 配下に置いたテンプレを参照する
  templateDir: isDev
    ? path.join(process.cwd(), 'src/renderer/src/components/common')
    : path.join(process.resourcesPath, 'templates')
})

contextBridge.exposeInMainWorld('electronAPI', {
  // ipcRenderer.invokeをラップし、ファイル読み込み機能のみを公開
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, contentToSave) => ipcRenderer.invoke('write-file', filePath, contentToSave),
  writeInputFile: (folderName, fileName, contentToSave) =>
    ipcRenderer.invoke('write-input-file', folderName, fileName, contentToSave),
  readOrCreateFile: (filePath: string, initialData: string) =>
    ipcRenderer.invoke('read-or-create-file', filePath, initialData),
  getNuclidesList: () => ipcRenderer.invoke('get-nuclides-list'),
  checkFileProgress: (dir, prefix, time) =>
    ipcRenderer.invoke('check-file-progress', dir, prefix, time),
  checkFileProgressforsibyl: (dir, prefix, time) =>
    ipcRenderer.invoke('check-file-progressforsibyl', dir, prefix, time),
  exists: (filePath: string) => ipcRenderer.invoke('exists', filePath),
  join: (...segments) => {
    return path.join(...segments)
  }
})
