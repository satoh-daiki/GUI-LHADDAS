import fs from 'fs'
import { exec } from 'child_process'
// import { spawn, SpawnOptions } from 'child_process'
import { Tasks } from '../Tasks'
import { promisify } from 'util'
import { fileExists } from './fileExists'
import { basename, dirname, resolve } from 'path'
import { cp, unlink } from 'fs/promises'
import { getInputFilePath, readLohdimLes入力 } from './getInput'
import { glob } from 'fast-glob'
import { renameSync } from 'fs'
import { getOutputPaths } from './getOutputPaths'
import { existsSync, mkdirSync } from 'fs'

/**
 * 計算を実行する
 */
export const runCalculation: Tasks['runCalculation'] = async (
  lohdimLes?: { bin: string; input: string },
  sibyl?: { bin: string; input: string }
) => {
  if (!lohdimLes && !sibyl) return false
  let { pathLohdimLes, pathSibyl } = await getInputFilePath(
    lohdimLes?.input ?? '',
    sibyl?.input ?? ''
  )

  if (!sibyl?.input || dirname(pathSibyl) === '.') { // 20260610hazama
    // SIBYLのパスが指定されていない場合は生成されるSIBYL用ファイル群の宛先を LOHDIM-LES の入力フォルダにする 
    const lohdimDirLocal = dirname(pathLohdimLes) // C:\...\LOHDIM-LES\examples\Simple
    pathSibyl = resolve(lohdimDirLocal, 'SIBYL_input.data')
    
    // フォルダが存在しない可能性に備えて自動作成しておく
    if (!existsSync(sibylDirCalculated)) {
      mkdirSync(sibylDirCalculated, { recursive: true })
    }
  }

  const lohdimDir = dirname(pathLohdimLes)
  const sibylDir = dirname(pathSibyl)

  try {
    // LOHDIM-LES実行
    if (lohdimLes) {
      // remove temp file
      const tempLohdimPath = resolve(lohdimDir, 'tempLOHDIM-LES_input.data')
      if (existsSync(tempLohdimPath)) {
        await unlink(tempLohdimPath)
      }
      
      const isOk = await runLohdimLes(lohdimLes.bin, pathLohdimLes, pathSibyl)
      if (!isOk) return false
    }
    // SIBYL実行
    if (sibyl && sibyl.bin) { // 20260610hazama
      // remove temp file
      const tempSibylPath = resolve(sibylDir, 'tempSIBYL_input.data')
      if (existsSync(tempSibylPath)) {
        await unlink(tempSibylPath)
      }
      // 全ての'SIBYL_GROUND_*.data', 'SIBYL_PLUME_*.data'に対してループを回す
      const paths = await getOutputPaths('', sibyl.input)
      for (const num in paths) {
        if (!paths[num].sibylGround && !paths[num].sibylPlume) continue
        const isOk = await runSibyl(sibyl.bin, pathSibyl, num)
        if (!isOk) return false
      }
    }
    return true
  } catch (e) {
    return false
  }
}

/**
 * LOHDIM-LESを実行
 */
async function runLohdimLes(binFile: string, inputFile: string, sibylInputFile: string) {
  const params = await readLohdimLes入力(inputFile)
  if (!(await fileExists(binFile))) return false

  const isBldgTerrainOn = String(params?.bldgTerrainCalc) === '1' 
  console.log('isBldgTerrainOn: ', isBldgTerrainOn,`[${params?.bldgTerrainCalc}]` )

  // フォルダのクリーンアップ
  const patterns = ['*.data', '*.dat', '*.txt']
  await removeAll(binFile, patterns)
  // 入力ファイルをコピー
  const restart = 'restart.dat' // 再計算時に読まれる再計算用ファイルの名前
  await copyFiles(inputFile, binFile, [
    basename(inputFile),
    params?.pathBuilding ?? '___building_data', // ex) oklahomacity.txt
    params?.pathElevation ?? '___elevation_data', // ex) terrain.txt
    params?.pathGrid ?? '___vertical_grid', // ex) zgrid.txt
    params?.pathRelease ?? '___release_rate', // ex) release.txt
    restart
  ])
  // 実行
  await runCommand(binFile)
  const isOk = await fileExists(resolve(dirname(binFile), 'SIBYL_PLUME_000.data')) // 出力ファイルがない場合は失敗したとみなす
  // 出力ファイルを入力フォルダに移動
  const restartPre = 'output.dat' // 実行時に出力される再計算用ファイルの名前（上書きされるのを防ぐために restart.dat にしていないとのこと）
  rename(binFile, restartPre, restart)

  const targetSibylInputFolder = dirname(sibylInputFile)
  const userSibylInputPath = resolve(targetSibylInputFolder, 'SIBYL_input.data')
  const hasUserSibylInput = existsSync(userSibylInputPath)

  // 出力ファイルをSIBYL入力フォルダにコピー
  // 建物・地形計算がoffの時はELEVATION.dataとSHIELD.dataをコピーしない
  const sibylFiles = [
    ...(isBldgTerrainOn ? ['ELEVATION.data', 'SHIELD.data'] : []),
    ...(!hasUserSibylInput ? ['SIBYL_input.data'] : []), //存在しない場合にのみSIBYL_input.dataを含める
    'Z.data',
    ...(await globNames(binFile, ['SIBYL_GROUND_*.data', 'SIBYL_PLUME_*.data']))
  ]

  // もし既にSIBYL_input.dataが存在した場合、こちらで生成したSIBYL_input.dataは削除
  if (hasUserSibylInput) {
    const defaultSibylInputInBin = resolve(dirname(binFile), 'SIBYL_input.data')
    if (existsSync(defaultSibylInputInBin)) {
      await unlink(defaultSibylInputInBin)
    }
  }

  // copyからmoveに変更済み
  // 実行フォルダからSIBYLフォルダへ、出力ファイルを移動
  moveFiles(binFile, sibylInputFile, sibylFiles)
  // 出力ファイルをLOHDIM-LES入力フォルダに移動
  // sibylFilesは除外済み（LOHDIM-LES入力フォルダには残さない）
  await moveFiles(binFile, inputFile, [
    restart,
    ...(await globNames(binFile, ['GUI_GROUND_*.data', 'GUI_PLUME_*.data']))
  ])
  // フォルダのクリーンアップ
  await removeAll(binFile, patterns)
  return isOk
}

/**
 * SIBYLを実行
 */
async function runSibyl(bin: string, input: string, num: string) {
  if (!(await fileExists(bin))) return false

  // フォルダのクリーンアップ
  const patterns = ['*.data', '*.out']
  await removeAll(bin, patterns)
  // 入力ファイルをコピー
  const plumeRenamed = 'PLUME.data'
  const plume = `SIBYL_PLUME_${num}.data`
  const groundRenamed = 'GROUND.data'
  const ground = `SIBYL_GROUND_${num}.data`
  const sibylInput = 'SIBYL_input.data'
  const sibylInputRenamed = 'INPUT.data'
  await copyFiles(input, bin, [
    'Z.data',
    'ELEVATION.data',
    'SHIELD.data',
    sibylInput,
    plume,
    ground
  ])
  rename(bin, plume, plumeRenamed)
  rename(bin, ground, groundRenamed)
  rename(bin, sibylInput, sibylInputRenamed)
  // 実行
  await runCommand(bin)
  // 出力ファイルを入力フォルダに移動
  const output = 'RESULT.out'
  const outputRenamed = `SIBYL_RESULT_${num}.out`
  const outputGui = 'GUI_DOSE.data'
  const outputGuiRenamed = `GUI_DOSE_${num}.data`
  const isOk = await fileExists(resolve(dirname(bin), output)) // 出力ファイルがない場合は失敗したとみなす
  rename(bin, output, outputRenamed)
  rename(bin, outputGui, outputGuiRenamed)
  moveFiles(bin, input, [outputRenamed, outputGuiRenamed])
  // フォルダのクリーンアップ
  await removeAll(bin, patterns)
  return isOk
}

/**
 * `path`にある実行形式を、`path`のフォルダ上で実行する
 */
async function runCommand(path: string) {
  const cwd = dirname(path)
  const execAsync = promisify(exec)
  const linux = `
terminals=("gnome-terminal" "konsole" "xterm" "lxterminal" "terminator")
for terminal in "\${terminals[@]}"; do
  if command -v $terminal &> /dev/null; then
    echo "Using $terminal"
    if [ $terminal = "gnome-terminal" ]; then
      gnome-terminal --wait -- bash -c "${path}"
    else
      $terminal -e bash -c "${path}"
    fi
    break
  fi
done
`
  const mac = `
osascript -e 'tell application "Terminal"
    do script "cd ${cwd} && ${path}"
    delay 1
    repeat while busy of window 1 is true
        delay 1
    end repeat
    close window 1
end tell'
`

  if (process.platform !== 'win32') {
    try {
      if (fs.existsSync(path)) {
      	fs.chmodSync(path, '755')
      }
    } catch (error) {
      console.error('failed to grant execute permission: ', error)
    }
  } 

  switch (process.platform) {
    case 'win32':
     await execAsync(`start cmd /c "${path}"`, { cwd })
      return
    case 'darwin':
      await execAsync(mac)
      return
    default:
      await execAsync(linux, { cwd, shell: '/bin/bash' })
      return
  }
}

/**
 * `bin`があるフォルダ内の`patterns`のいずれかにマッチするファイルを全て削除する
 */
async function removeAll(bin: string, patterns: string[]) {
  const files = await globNames(bin, patterns)
  await removeFiles(bin, files)
  return

  // ローカル関数
  // `bin`があるフォルダ内の`files`を全て削除する
  async function removeFiles(bin: string, files: string[]) {
    const dir = dirname(bin)
    for (const file of files) {
      try {
        await unlink(resolve(dir, file))
      } catch {}
    }
  }
}

/**
 * `pathFrom`があるフォルダ内の`files`を、`pathTo`があるフォルダにコピーする。
 * `pathFrom, pathTo`はフォルダではなくファイルのパス。
 */
async function copyFiles(pathFrom: string, pathTo: string, files: string[]) {
  const dirFrom = dirname(pathFrom)
  const dirTo = dirname(pathTo)
  for (const file of files) {
    const from = resolve(dirFrom, file)
    const to = resolve(dirTo, file)
   
    try {
      await cp(from, to, { force: true })
      console.log(`Successfully copied ${file} to ${to}`);
    } catch (error) {
      console.error(`Failed to copy ${file}:`, error)
    }
  }
}

/**
 * `pathFrom`があるフォルダ内の`files`を、`pathTo`があるフォルダに移動する。
 * `pathFrom, pathTo`はフォルダではなくファイルのパス。
 */
function moveFiles(pathFrom: string, pathTo: string, files: string[]) {
  const dirFrom = dirname(pathFrom)
  const dirTo = dirname(pathTo)

  for (const file of files) {
    try {
      const from = resolve(dirFrom, file)
      const to = resolve(dirTo, file)
      renameSync(from, to)
      // renameSync は to が存在している場合、上書きする
    } catch (e){
    }
  }
}

/**
 * `bin`があるフォルダ内のファイル`nameFrom`を`nameTo`に改名する
 */
function rename(bin: string, nameFrom: string, nameTo: string) {
  const dir = dirname(bin)
  try {
    const from = resolve(dir, nameFrom)
    const to = resolve(dir, nameTo)
    renameSync(from, to)
  } catch {}
}

/**
 * `bin`があるフォルダ内で`patter`のどれかに一致するファイル一覧を返す
 */
async function globNames(bin: string, patterns: string[]) {
  const dirBin = dirname(bin).replaceAll('\\', '/')
  const paths = await glob(patterns.map((f) => `${dirBin}/` + f))
  return paths.map((p) => basename(p))
}

/**
 * モックアップ
 */
export const runCalculation_mock: Tasks['runCalculation'] = async (
  lohdimLes?: { bin: string; input: string },
  sibyl?: { bin: string; input: string }
) => {
  if (!lohdimLes && !sibyl) return false

  try {
    switch (process.platform) {
      case 'win32':
        await promisify(exec)(`start cmd /c pause`)
        return true
      case 'darwin':
        // not implemented
        return true
      default:
        // not implemented
        return true
    }
  } catch {
    return false
  }
}
