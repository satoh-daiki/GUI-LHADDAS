import { FileFilter, ipcMain, ipcRenderer } from 'electron'
import { getPlatform } from './Tasks.impl/getPlatform'
import { openFileDialog } from './Tasks.impl/openFileDialog'
import { openFolderDialog } from './Tasks.impl/openFolderDialog'
import { fileExists } from './Tasks.impl/fileExists'
import { runCalculation } from './Tasks.impl/runCalculation'
import { getInput } from './Tasks.impl/getInput'
import { getOutputPaths } from './Tasks.impl/getOutputPaths'
import { getOutputSibyl2D } from './Tasks.impl/getOutputSibyl2D'
import { Input } from '../renderer/src/Input'
import { Output2D, Output3D, TypeOutputFile } from '../renderer/src/Output'
import { getOutputLohdimLes2D } from './Tasks.impl/getOutputLohdimLes2D'
import { getOutputLohdimLes3D } from './Tasks.impl/getOutputLohdimLes3D'

/**
 * renderer側から必要になるElectronの機能
 */
export interface Tasks {
  /**
   * "win32"などを返す
   */
  getPlatform: () => Promise<NodeJS.Platform> // プラットフォーム名の取得自体はasyncにする必要はないが、renderer側からのアクセスはasyncになるのでそれに合わせている（renderer側で呼ぶときの型情報はここのもの使いまわしている）
  /**
   * ファイルダイアログからファイルを選択する
   */
  openFileDialog: (defaultValue?: string, filters?: FileFilter[]) => Promise<string | undefined>
  /**
   * フォルダダイアログからフォルダを選択する
   */
  openFolderDialog: (defaultValue?: string) => Promise<string | undefined>
  /**
   * ファイルが存在するかを返す
   */
  fileExists: (path: string) => Promise<boolean>
  /**
   * 計算を実行する
   */
  runCalculation: (
    lohdimLes?: { bin: string; input: string },
    sibyl?: { bin: string; input: string }
  ) => Promise<boolean>
  /**
   * 入力データを取得する
   */
  getInput: (path入力LohdimLes: string, path入力Sibyl: string) => Promise<Input>
  /**
   * 出力ファイル一覧を取得する
   */
  getOutputPaths: (
    dir入力LohdimLes: string,
    dir入力Sibyl: string
  ) => Promise<Record<string, Partial<Record<TypeOutputFile, string>>>>
  /**
   * LOHDIM-LESの出力データ（地表沈着濃度）を取得する
   * 読込み中と区別するために失敗時は`undefined`ではなく`null`を返す。
   */
  getOutputLohdimLes2D: (path: string, nx: number, ny: number) => Promise<Output2D | null>
  /**
   * LOHDIM-LESの出力データ（大気中濃度）を取得する
   * 読込み中と区別するために失敗時は`undefined`ではなく`null`を返す。
   */
  getOutputLohdimLes3D: (
    path: string,
    nx: number,
    ny: number,
    nz: number
  ) => Promise<Output3D | null>
  /**
   * SIBYLの出力データを取得する。
   * 読込み中と区別するために失敗時は`undefined`ではなく`null`を返す。
   */
  getOutputSibyl2D: (path: string, nx: number, ny: number) => Promise<Output2D | null>
}

const tasks: Tasks = {
  getPlatform,
  openFileDialog,
  openFolderDialog,
  fileExists,
  runCalculation,
  getInput,
  getOutputPaths,
  getOutputLohdimLes2D,
  getOutputLohdimLes3D,
  getOutputSibyl2D
}

/**
 * windowオブジェクトに追加するTasksのAPI一覧を取得する
 */
export function getApiTasks() {
  return Object.fromEntries(
    Object.keys(tasks).map((name) => [name, (...args: any[]) => ipcRenderer.invoke(name, ...args)])
  )
}

/**
 * Tasksをプロセス間通信モジュールに登録する。
 * （TasksはElectronの機能を使うので、renderer側から実行するにはプロセス間通信が必要。）
 */
export function ipcRegister() {
  for (const task in tasks) {
    ipcMain.handle(task, (_, ...args) => tasks[task](...args))
  }
}
