import { app, shell, BrowserWindow, session, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ipcRegister } from './Tasks'
const fs = require('fs')
import * as path from 'path'

const PROJECT_ROOT = app.getAppPath()

app.commandLine.appendSwitch('ignore-gpu-blocklist')

// ビルド後にログを確認するためログファイルを作成
const logPath = path.join(app.getPath('userData'), 'app-debug.log')
const logDirPath = path.dirname(logPath)
if (!fs.existsSync(logDirPath)) {
  try {
    fs.mkdirSync(logDirPath, { recursive: true })
    console.log(`Log directory created: ${logDirPath}`)
  } catch (e) {
    console.error(`Failed to create log directory: ${logDirPath}`, e)
  }
}

const writeLog = (message: string) => {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`
  fs.appendFileSync(logPath, logEntry)
}

const originalLog = console.log
console.log = (...args) => {
  const message = args
    .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
    .join(' ')
  originalLog(...args)
  writeLog(message)
}

// const APP_ROOT_PATH = path.join(
//     process.resourcesPath,
//     '..',
//     '..',
//     '..',
//     '..',
// );

let SIBYL_DIR: string

if (app.isPackaged) {
  // ビルド環境
  // 放射性核種のリストを生成するのに必要なSIBYLフォルダは resources フォルダ直下に同梱する
  SIBYL_DIR = path.join(process.resourcesPath, 'SIBYL')
} else {
  // 開発環境
  SIBYL_DIR = path.join(PROJECT_ROOT, '..', '..', 'SIBYL')
}

const NUCLIDE_DATA_DIR = path.join(SIBYL_DIR, 'bin', 'RESP', '1000m')

ipcMain.handle('read-file', async (_, filePath) => {
  // Return file contents as string. If it fails, throw to reject the invoke() promise.
  return await fs.promises.readFile(filePath, 'utf-8')
})

ipcMain.handle('write-file', async (_, filePath, content) => {
  console.log(`Received request to write to file: ${filePath}`)
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`Successfully wrote to file: ${filePath}`)
    return true
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to write to file: ${error.message}`)
    }
    throw new Error('Failed to write to file: Unknown error')
  }
})

ipcMain.handle('write-input-file', (_, folderName, fileName, fileContent) => {
  if (!fileContent || typeof fileContent !== 'string') {
    console.error('File content is invalid or missing.')
    throw new Error('Input data content is invalid.')
  }

  try {
    const savePath = join(folderName, fileName)

    fs.writeFileSync(savePath, fileContent, 'utf-8')

    console.log(`Successfully wrote ${fileName} in ${savePath}`)
    return true
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to write to file (${fileName}): ${error.message}`)
    }
    throw new Error(`Failed to write to file (${fileName}): Unknown error`)
  }
})

ipcMain.handle('read-or-create-file', async (_, filePath, initialData) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      try {
        fs.writeFileSync(filePath, initialData, 'utf-8')
        return initialData
      } catch (writeError) {
        if (writeError instanceof Error) {
          throw new Error(`Failed to create file: ${writeError.message}`)
        }
        throw new Error(`Failed to create file: Unknown write error`)
      }
    } else if (error instanceof Error) {
      throw new Error(`Error reading file: ${error.message}`)
    }
    throw new Error(`Error reading file: Unknown error`)
  }
})

ipcMain.handle('get-nuclides-list', async (_) => {
  try {
    const files = fs.promises.readdir(NUCLIDE_DATA_DIR)

    return files
  } catch (error) {
    console.error('Failed to read nuclide directory: ', error)
    return []
  }
})

ipcMain.handle('check-file-progress', async (_, dirPath, filePrefix, startTime) => {
  const logtime = new Date().toISOString()

  // filePrefix は "GUI_GROUND" または "PLUME" を想定
  // startTime は実行ボタンを押した時刻 (ミリ秒)
  try {
    // dirPath が exe のフルパスで渡ってきた場合は、その親フォルダ(bin)を監視対象にする
    const watchDir =
      fs.existsSync(dirPath) && fs.statSync(dirPath).isFile() ? path.dirname(dirPath) : dirPath

    // 1. ディレクトリ内の全ファイルを取得
    const files = fs.readdirSync(watchDir)

    let maxNumber = 0

    // 2. 正規表現を作成 (例: /^GUI_GROUND_(\d{3})\.data$/)
    // \d{3} は3桁の数字を意味します
    const regex = new RegExp(`^${filePrefix}_(\\d{3})\\.data$`)


    for (const file of files) {
      const match = file.match(regex)
      if (!match) continue // ← 形式を絞る

      const fullPath = path.join(watchDir, file)
      const stats = fs.statSync(fullPath)

    }

    let pickedFile: string | null = null 
    let pickedMtimeMs: number | null = null 

    for (const file of files) {
      const match = file.match(regex)

      // ファイル名がパターンに一致するか確認
      if (match) {
        const fullPath = path.join(watchDir, file)
        const stats = fs.statSync(fullPath)

        // 3. タイムスタンプの確認
        // ファイルの更新日時(mtime) が 実行開始時間(startTime) より新しいか？
        // ※ 古いファイルが残っていた場合にカウントしないための処理
        if (stats.mtimeMs > startTime) {
          const number = parseInt(match[1], 10) // "002" -> 2

          // 4. 最新(最大)の番号を保持する
          if (number > maxNumber) {
            maxNumber = number

            pickedFile = file 
            pickedMtimeMs = stats.mtimeMs 

          }
        }
      }
    }

    // 000 はカウントに含めない、かつ 002 があれば 2 を返す仕様
    // 初期値が 0 なので、見つからなければ 0、002が見つかれば 2 が返ります
    return maxNumber
  } catch (error) {
    console.error('File check error:', error)
    return 0 // エラー時は0を返して進行を止めるなどの対処
  }
})

ipcMain.handle('check-file-progressforsibyl', async (_, dirPath, filePrefix, startTime) => {
  const logtime = new Date().toISOString()
  // SIBYL進捗は「入力(SIBYL_GROUND/SIBYL_PLUME)」ではなく
  // ケース完了ごとに増える「結果ファイル(GUI_DOSE_###.data / SIBYL_RESULT_###.out)」で判定する
  // filePrefix は互換のため受け取るが、進捗判定では GUI_DOSE / SIBYL_RESULT を優先する
  // startTime は実行ボタンを押した時刻 (ミリ秒)
  try {
    // 1. ディレクトリ内の全ファイルを取得
    const files = fs.readdirSync(dirPath)

    let maxNumber = 0

    // 2. 正規表現を作成 (例: /^GUI_GROUND_(\d{3})\.data$/)
    // \d{3} は3桁の数字を意味します
    // 2. 進捗として見るべきファイル（ケース完了の証拠）
    //   - GUI_DOSE_###.data
    //   - SIBYL_RESULT_###.out
    // ※入力の SIBYL_GROUND_###.data / SIBYL_PLUME_###.data は進捗にはならない
    const doseRegex = /^GUI_DOSE_(\d{3})\.data$/
    const resultRegex = /^SIBYL_RESULT_(\d{3})\.out$/

    for (const file of files) {
      const match = file.match(doseRegex) || file.match(resultRegex)

      if (!match) continue // ← ★ 形式を絞る

      const fullPath = path.join(dirPath, file)
      const stats = fs.statSync(fullPath)

    }

    let pickedFile: string | null = null 
    let pickedMtimeMs: number | null = null 

    for (const file of files) {
      const match = file.match(doseRegex) || file.match(resultRegex)

      // ファイル名がパターンに一致するか確認
      if (match) {
        const fullPath = path.join(dirPath, file)
        const stats = fs.statSync(fullPath)

        // 3. タイムスタンプの確認
        // ファイルの更新日時(mtime) が 実行開始時間(startTime) より新しいか？
        // ※ 古いファイルが残っていた場合にカウントしないための処理
        if (stats.mtimeMs > startTime) {
          const number = parseInt(match[1], 10) // "002" -> 2

          // 4. 最新(最大)の番号を保持する
          if (number > maxNumber) {
            maxNumber = number
          }
        }
      }
    }

    // 000 はカウントに含めない、かつ 002 があれば 2 を返す仕様
    // 初期値が 0 なので、見つからなければ 0、002が見つかれば 2 が返ります
    return maxNumber
  } catch (error) {
    console.error('File check error:', error)
    return 0 // エラー時は0を返して進行を止めるなどの対処
  }
})

ipcMain.handle('exists', (event, filePath) => {
  return fs.existsSync(filePath)
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      devTools: is.dev,
      sandbox: false
    }
  })

  // renderer 側の console を main のログに流す
  mainWindow.webContents.on('console-message', (_e, level, message, line, sourceId) => {
  })

  // renderer プロセスが落ちた場合
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
  })

  // HTML / JS のロード失敗
  mainWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
    console.log('[did-fail-load]', {
      errorCode,
      errorDescription,
      validatedURL
    })
  })

  mainWindow.on('ready-to-show', () => {
    if (!is.dev) {
      mainWindow.removeMenu()
    }

    // 以下のリクエストヘッダを指定しておかないと、OpenStreetMapからのデータ取得できなく（または遅く）なる(418コードが返る)。
    // 問題になるのはビルド後である。
    // 開発時は開発サーバからリクエストするので、これらのヘッダは自動的に付加される。
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['Origin'] = 'electron://localhost'
      details.requestHeaders['Referer'] = 'electron://localhost'
      callback({ cancel: false, requestHeaders: details.requestHeaders })
    })

    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // renderer側からTasks.tsの処理を呼べるようにする
  ipcRegister()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
