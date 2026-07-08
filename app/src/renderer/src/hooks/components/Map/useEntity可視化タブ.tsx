import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { deriv計算領域 } from '../../atoms/deriv計算領域'
import { useTranslation } from 'react-i18next'
import {
  atomMap設定_放出点セル,
  atomMap設定_放出点経緯度,
  atomMap設定_画像
} from '../../atoms/atomsMap設定'
import {
  atomGlobal_is読込み中,
  atomGlobal_snackbar,
  atomGlobal_tabName
} from '../../atoms/atomsGlobal'
import {
  atom可視化_sliceAxis,
  atom可視化_sliceChecked,
  atom可視化_slicePosition,
  atom可視化_timePosition,
  atom可視化_地表沈着濃度Checked,
  atom可視化_地表沈着濃度Max,
  atom可視化_地表沈着濃度MaxLimit,
  atom可視化_地表沈着濃度Min,
  atom可視化_地表沈着濃度MinLimit,
  atom可視化_地表沈着濃度Scale,
  atom可視化_大気中濃度Checked,
  atom可視化_大気中濃度Max,
  atom可視化_大気中濃度MaxLimit,
  atom可視化_大気中濃度Middle,
  atom可視化_大気中濃度Min,
  atom可視化_大気中濃度MinLimit,
  atom可視化_大気中濃度Scale,
  atom可視化_線量率Checked,
  atom可視化_線量率Max,
  atom可視化_線量率MaxLimit,
  atom可視化_線量率Min,
  atom可視化_線量率MinLimit,
  atom可視化_線量率Scale,
  atom可視化_線量率Unit
} from '@renderer/hooks/atoms/atoms可視化タブ'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deriv可視化_Data地表沈着濃度,
  deriv可視化_Data地表沈着濃度Reading,
  deriv可視化_Data大気中濃度,
  deriv可視化_Data大気中濃度Reading,
  deriv可視化_Data線量率,
  deriv可視化_Data線量率Reading
} from '@renderer/hooks/atoms/deriv可視化_Data'
import { DEFAULT_MINMAX } from '@renderer/hooks/atoms/deriv可視化_Reset'
import { deriv計算_paths出力 } from '@renderer/hooks/atoms/deriv計算_path'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { clamp } from '@renderer/utils/clamp'
import { Output2D, TypeOutputFile } from '@renderer/Output'
import { Cartesian3, ClippingPlane } from 'cesium'
import { useCesium } from 'resium'
import { Mesh } from '@renderer/Input'
import { atom建物オフセット } from '@renderer/hooks/atoms/atomsMap設定'
import { offsetRectangleMeters } from '@renderer/utils/cesium/offsetRectangle'

export function useEntity可視化タブ() {
  const tabName = useAtomValue(atomGlobal_tabName)
  const 大気中濃度Checked = useAtomValue(atom可視化_大気中濃度Checked)
  const 地表沈着濃度Checked = useAtomValue(atom可視化_地表沈着濃度Checked)
  const 線量率Checked = useAtomValue(atom可視化_線量率Checked)
  const { viewer } = useCesium()
  const [waiting, setWaiting] = useAtom(atomGlobal_is読込み中)

  const is可視化タブ = tabName === '可視化タブ'
  const show計算領域 = is可視化タブ && !地表沈着濃度Checked && !線量率Checked
  const show大気中濃度 = is可視化タブ && 大気中濃度Checked
  const show地表沈着濃度 = is可視化タブ && 地表沈着濃度Checked
  const show線量率 = is可視化タブ && 線量率Checked

  // Cesiumの再描画
  // 以下の問題を解消する：
  // 大気中濃度と地表沈着濃度を表示する → 大気中濃度だけ非表示にする → 画面が更新されない
   useEffect(() => {
     viewer?.scene.requestRender()
   }, [viewer, show地表沈着濃度, show大気中濃度, show線量率, show計算領域])
   // レンダリング終了時にプログレスインジケータを消す
   useEffect(() => {
     if (!viewer) return
     const handlePrerender = () => {
       if (!waiting) return
       setTimeout(() => {
         viewer?.scene.requestRender()
         setWaiting(false)
       }, 100)
     }
     viewer.scene.postRender.addEventListener(handlePrerender)
     return () => {
       viewer.scene.postRender.removeEventListener(handlePrerender)
     }
   }, [viewer, waiting])

  return {
    show計算領域,
    show大気中濃度,
    show地表沈着濃度,
    show線量率
  }
}

export function useEntity可視化タブ_計算領域() {
  //const 計算領域 = useAtomValue(deriv計算領域)
  const 計算領域Raw = useAtomValue(deriv計算領域)
  const map画像 = useAtomValue(atomMap設定_画像)
  const is地理院地図 = map画像 === '地理院地図'

  // 地図補正（建物オフセット）と同じだけ計算領域の枠も平行移動させる
  const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット)
  const 計算領域 = useMemo(() => {
	if (!計算領域Raw || !計算領域Raw.rectangleLohdimLes) return undefined
    //if (!計算領域Raw) return undefined
	try {
      return {
        ...計算領域Raw,
        rectangleLohdimLes: offsetRectangleMeters(
          計算領域Raw.rectangleLohdimLes,
          offsetX,
          offsetY
        ),
        rectangleSibyl: 計算領域Raw.rectangleSibyl
          ? offsetRectangleMeters(計算領域Raw.rectangleSibyl, offsetX, offsetY)
          : undefined
      }
	} catch(e) {
	  console.error("failed to offset rectangle: ", e)
      return undefined
	}
    
  }, [計算領域Raw, offsetX, offsetY])

  return {
    計算領域,
    is地理院地図
  }
}

export function useEntity可視化タブ_大気中濃度() {
  const output3D = useAtomValue(deriv可視化_Data大気中濃度) // 地表沈着濃度データの読み込みはこの行が実行されたときに行われる
  const paths = useAtomValue(deriv計算_paths出力)
  const time = useAtomValue(atom可視化_timePosition)
  const 放出点 = useAtomValue(atomMap設定_放出点経緯度)
  const 放出点セル = useAtomValue(atomMap設定_放出点セル)
  const input = useAtomValue(deriv計算_入力)
  const sliceChecked = useAtomValue(atom可視化_sliceChecked)
  const sliceAxis = useAtomValue(atom可視化_sliceAxis)
  const slicePosition = useAtomValue(atom可視化_slicePosition)
  const [min, setMin] = useAtom(atom可視化_大気中濃度Min)
  const [middle, setMiddle] = useAtom(atom可視化_大気中濃度Middle)
  const [max, setMax] = useAtom(atom可視化_大気中濃度Max)
  const setMinLimit = useSetAtom(atom可視化_大気中濃度MinLimit)
  const setMaxLimit = useSetAtom(atom可視化_大気中濃度MaxLimit)
  const scale = useAtomValue(atom可視化_大気中濃度Scale)
  const 大気中濃度Checked = useAtomValue(atom可視化_大気中濃度Checked)
  const setWaiting = useSetAtom(atomGlobal_is読込み中)
  const setReading = useSetAtom(deriv可視化_Data大気中濃度Reading)
  const setSnackbar = useSetAtom(atomGlobal_snackbar)
  const clip = useMemo(() => {
    if (!sliceChecked) return undefined
    const plane =
      sliceAxis === 'x'
        ? new Cartesian3(-1, 0, 0)
        : sliceAxis === 'y'
          ? new Cartesian3(0, -1, 0)
          : new Cartesian3(0, 0, 1)
    const position = (sliceAxis === 'z' ? -1 : 1) * slicePosition
    return new ClippingPlane(plane, position)
  }, [sliceChecked, sliceAxis, slicePosition])
  // 地図補正（建物オフセット）: 可視化の3Dも同じだけ平行移動させる
  const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット)

  // output3D が変更されたら、表示範囲スライダーにも反映させる。
  useEffect(() => {
    if (output3D === null) setSnackbar('大気中濃度の読み込みに失敗しました')
  }, [output3D, time])
  useEffect(() => {
    setReading(output3D === undefined)
    if (!output3D) return
    setSnackbar(undefined)
    setMinLimit(output3D.minNonZero)
    setMaxLimit(output3D.maxNonZero)
    // 選択範囲の初期設定
    if (min === DEFAULT_MINMAX && middle === DEFAULT_MINMAX && max === DEFAULT_MINMAX) {
      if (time === 0) {
        setMin(output3D.minNonZero)
        setMiddle(output3D.minNonZero)
        setMax(output3D.maxNonZero)
      } else {
        // 初期時刻でない場合は、初期時刻のデータを読み直す
        const path = getFirst(paths, 'guiPlume')
        const n = input?.lohdimLes ?? input?.sibyl
        if (path && n) {
          window.tasks
            .getOutputLohdimLes3D(path, n.nx, n.ny, n.nz)
            .then((o) => {
              if (!o) {
                return
              }
              setMin(o.minNonZero)
              setMiddle(o.minNonZero)
              setMax(o.maxNonZero)
            })
            .catch(() => undefined)
        } else {
        }
      }
    }
  }, [output3D, 大気中濃度Checked]) // output2D, 大気中濃度Checked以外が変更されても何もしなくてよい
  useEffect(() => {
    if (!output3D || 大気中濃度Checked) {
      setWaiting(true)
    }
    if (output3D === null) {
      setWaiting(false)
    }
  }, [output3D, 大気中濃度Checked])

  const mesh: Mesh | undefined = input?.lohdimLes
  const sizeXY = mesh?.cellSize
  const zData = mesh?.zData

  return {
    放出点,
    output3D,
    sizeXY,
    zData,
    clip,
    放出点セル,
    min,
    middle,
    max,
    scale,
    offsetX,
    offsetY
  }
}

export function useEntity可視化タブ_地表沈着濃度() {
  const output2D = useAtomValue(deriv可視化_Data地表沈着濃度) // 地表沈着濃度データの読み込みはこの行が実行されたときに行われる
  const 計算領域 = useAtomValue(deriv計算領域)
  const scale = useAtomValue(atom可視化_地表沈着濃度Scale)
  const [min, setMin] = useAtom(atom可視化_地表沈着濃度Min)
  const [max, setMax] = useAtom(atom可視化_地表沈着濃度Max)
  const setMinLimit = useSetAtom(atom可視化_地表沈着濃度MinLimit)
  const setMaxLimit = useSetAtom(atom可視化_地表沈着濃度MaxLimit)
  const paths = useAtomValue(deriv計算_paths出力)
  const time = useAtomValue(atom可視化_timePosition)
  const input = useAtomValue(deriv計算_入力)
  const setReading = useSetAtom(deriv可視化_Data地表沈着濃度Reading)
  const setSnackbar = useSetAtom(atomGlobal_snackbar)

  //	const rectangle = 計算領域?.rectangleLohdimLes
   const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット)
  const rectangle = useMemo(() => {
    if (!計算領域?.rectangleLohdimLes) return undefined
    return offsetRectangleMeters(計算領域.rectangleLohdimLes, offsetX, offsetY)
  }, [計算領域?.rectangleLohdimLes, offsetX, offsetY])
  const cellSize = input?.lohdimLes?.cellSize
  const getValue = useCallback(getValueFunc(output2D, 'Bq/m²'), [output2D])

  // output2D が変更されたら、表示範囲スライダーにも反映させる。
  useEffect(() => {
    if (output2D === null) setSnackbar('地表沈着濃度の読み込みに失敗しました')
  }, [output2D, time])
  useEffect(() => {
    setReading(output2D === undefined)
    if (!output2D) return
    setSnackbar(undefined)
    setMinLimit(output2D.minNonZero)
    setMaxLimit(output2D.maxNonZero)
    // 選択範囲の初期設定
    if (min === DEFAULT_MINMAX && max === DEFAULT_MINMAX) {
      if (time === 0) {
        setMin(output2D.minNonZero)
        setMax(output2D.maxNonZero)
      } else {
        // 初期時刻でない場合は、初期時刻のデータを読み直す
        const path = getFirst(paths, 'guiGround')
        const n = input?.lohdimLes
        if (path && n) {
          window.tasks
            .getOutputLohdimLes2D(path, n.nx, n.ny)
            .then((o) => {
              if (!o) return
              setMin(o.minNonZero)
              setMax(o.maxNonZero)
            })
            .catch(() => undefined)
        }
      }
    }
  }, [output2D]) // output2D以外が変更されても何もしなくてよい

  return {
    min,
    max,
    scale,
    output2D,
    rectangle,
    cellSize,
    getValue
  }
}

export function useEntity可視化タブ_線量率() {
  const output2D = useAtomValue(deriv可視化_Data線量率) 
  const 計算領域 = useAtomValue(deriv計算領域)
  const [unit, setUnit] = useAtom(atom可視化_線量率Unit)
  const scale = useAtomValue(atom可視化_線量率Scale)
  const [min, setMin] = useAtom(atom可視化_線量率Min)
  const [max, setMax] = useAtom(atom可視化_線量率Max)
  const setMinLimit = useSetAtom(atom可視化_線量率MinLimit)
  const setMaxLimit = useSetAtom(atom可視化_線量率MaxLimit)
  const paths = useAtomValue(deriv計算_paths出力)
  const time = useAtomValue(atom可視化_timePosition)
  const input = useAtomValue(deriv計算_入力)
  const setReading = useSetAtom(deriv可視化_Data線量率Reading)
  const setSnackbar = useSetAtom(atomGlobal_snackbar)
  const { t } = useTranslation()

  const [label, setLabel] = useState<string>(t('dose_rate_ambient_label'))

  const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット)
  const rectangle = useMemo(() => {
    if (!計算領域?.rectangleSibyl) return undefined
    return offsetRectangleMeters(計算領域.rectangleSibyl, offsetX, offsetY)
  }, [計算領域?.rectangleSibyl, offsetX, offsetY])

  useEffect(() => {
    // 現在表示しようとしている結果ファイルのフルパスを取得（例: .../GUI_DOSE_000.data）
    const pathDose = getFirst(paths, 'guiDose')
    if (!pathDose) return

    const syncLatestUnit = async () => {
      try {
        // フルパスから親フォルダのパスを抽出する
        const lastSlash = Math.max(pathDose.lastIndexOf('/'), pathDose.lastIndexOf('\\'))
        const folderPath = lastSlash !== -1 ? pathDose.substring(0, lastSlash) : ''
        
        // そのフォルダ直下の SIBYL_input.data のパスを結合
        const inputFilePath = await window.electronAPI.join(folderPath, 'SIBYL_input.data')
        const exists = await window.electronAPI.exists(inputFilePath)
        
        if (exists) {
          // キャッシュを通さず、ディスクから直接ファイルを読み込む
          const content = await window.electronAPI.readFile(inputFilePath)
          const isAirKerma = content.includes('_K_')
          
          if (isAirKerma) {
            setLabel(t('dose_rate_airkerma_label'))
            setUnit('μGy/h')
          } else {
            setLabel(t('dose_rate_ambient_label'))
            setUnit('μSv/h')
          }
        }
      } catch (e) {
        console.error('[UnitSync] Failed to sync unit from file:', e)
      }
    }

    syncLatestUnit()
  }, [output2D, paths, t, setUnit]) 

  const cellSize = input?.sibyl?.cellSize
  const getValue = useCallback(getValueFunc(output2D, unit), [output2D, unit])

  useEffect(() => {
    if (output2D === null) setSnackbar('線量率の読み込みに失敗しました')
  }, [output2D, time])

  // output2D が変更されたら、表示範囲スライダーにも反映させる。
  useEffect(() => {
    setReading(output2D === undefined)
    if (!output2D) return
    setSnackbar(undefined)
    setMinLimit(output2D.minNonZero)
    setMaxLimit(output2D.maxNonZero)
    // 選択範囲の初期設定
    if (min === DEFAULT_MINMAX && max === DEFAULT_MINMAX) {
      if (time === 0) {
        setMin(output2D.minNonZero)
        setMax(output2D.maxNonZero)
      } else {
        const path = getFirst(paths, 'guiDose')
        const n = input?.sibyl
        if (path && n) {
          window.tasks
            .getOutputSibyl2D(path, n.nx, n.ny)
            .then((o) => {
              if (!o) return
              setMin(o.minNonZero)
              setMax(o.maxNonZero)
            })
            .catch(() => undefined)
        }
      }
    }
  }, [output2D]) 

  return {
    label,
    min,
    max,
    scale,
    output2D,
    rectangle,
    cellSize,
    getValue
  }
}

function getValueFunc(output2D: Output2D | null | undefined, unit: string) {
  return (ix: number, iy: number) => {
    const outOfRange =
      !output2D || ix != clamp(0, ix, output2D.nx - 1) || iy != clamp(0, iy, output2D.ny - 1)
    if (outOfRange) return undefined
    const value = output2D.data[iy * output2D.nx + ix]
    if (value < 0) return undefined
    return `${value.toExponential(2)} ${unit}`
  }
}

/**
 * `paths`内に含まれる`dataType`の値のうち`key`が最小のものを返す。
 * 無ければ`undefined`。
 */
function getFirst(
  paths: Record<string, Record<string, string>> | undefined,
  dataType: TypeOutputFile
) {
  if (!paths) return undefined
  const keys = Object.keys(paths).sort()
  for (const key of keys) {
    const path = paths[key][dataType]
    if (path) return path
  }
  return undefined
}
