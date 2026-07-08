import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import {
  atom計算_LohdimLes入力フォルダ,
  atom計算_LohdimLes有効,
  atom計算_LohdimLes実行ファイル,
  atom計算_Sibyl入力フォルダ,
  atom計算_Sibyl有効,
  atom計算_Sibyl実行ファイル
} from '../../atoms/atoms計算タブ'
import { useCallback, useEffect } from 'react'
import { atomGlobal_is計算中, atomGlobal_platform } from '../../atoms/atomsGlobal'
import { deriv計算_is計算可能 } from '@renderer/hooks/atoms/deriv計算_is計算可能'
import { deriv計算_exists } from '@renderer/hooks/atoms/deriv計算_exists'
import {
  atomMap設定_放出点セル,
  atomMap設定_放出点セルラベル
} from '@renderer/hooks/atoms/atomsMap設定'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { formDataAtom } from '@renderer/hooks/atoms/atoms入力_sibyl.ts'

export function useTab計算() {
  const [lohdimLes実行ファイル, setLohdimLes実行ファイル] = useAtom(atom計算_LohdimLes実行ファイル)
  const [sibyl実行ファイル, setSibyl実行ファイル] = useAtom(atom計算_Sibyl実行ファイル)
  const [lohdimLes入力フォルダ, setLohdimLes入力フォルダ_] = useAtom(atom計算_LohdimLes入力フォルダ)
  const [sibyl入力フォルダ, setSibyl入力フォルダ] = useAtom(atom計算_Sibyl入力フォルダ)
  const [lohdimLes有効, setLohdimLes有効] = useAtom(atom計算_LohdimLes有効)
  const [sibyl有効, setSibyl有効] = useAtom(atom計算_Sibyl有効)
  const set放出点セルラベル = useSetAtom(atomMap設定_放出点セルラベル)
  const set放出点セル = useSetAtom(atomMap設定_放出点セル)
  const input = useAtomValue(deriv計算_入力)
  const formData = useAtomValue(formDataAtom)

  useEffect(() => {
    if (!input?.lohdimLes) return
    const 放出点 = input.lohdimLes.放出点
    set放出点セルラベル({
      x: 放出点.x.toString(),
      y: 放出点.y.toString(),
      z: 放出点.z.toString()
    })
    set放出点セル(放出点)
  }, [input])

  const is計算中 = useAtomValue(atomGlobal_is計算中);

  const setIs計算中 = useSetAtom(atomGlobal_is計算中)
  const platform = useAtomValue(atomGlobal_platform)
  const is計算可能 = useAtomValue(deriv計算_is計算可能) ?? false
  const exists = useAtomValue(deriv計算_exists)

  const extension = platform === 'win32' ? 'exe' : undefined
  const setLohdimLes入力フォルダ = useCallback((path: string) => {
    setLohdimLes入力フォルダ_(path)
    set放出点セルラベル({ x: '1', y: '1', z: '1' })
    set放出点セル({ x: 1, y: 1, z: 1 })
  }, [])
  const run計算 = useCallback(async () => {
    if (!is計算可能) return

    setIs計算中(true)
    const lohdimLes =
      lohdimLes有効 && exists?.lohdimLes
        ? { bin: lohdimLes実行ファイル, input: lohdimLes入力フォルダ }
        : undefined

    const sibyl = (sibyl有効 && exists?.sibyl)
      ? { bin: sibyl実行ファイル, input: sibyl入力フォルダ }
      : sibyl入力フォルダ
        ? { bin: '', input: sibyl入力フォルダ }
        : undefined

    // const sibyl =
    //   sibyl有効 && exists?.sibyl ? { bin: sibyl実行ファイル, input: sibyl入力フォルダ } : undefined
    await window.tasks.runCalculation(lohdimLes, sibyl)
    if (!!lohdimLes && !!sibyl) {
      // LOHDIM-LES => SIBYL の連続計算の場合、計算後にSIBYLの入力ファイルが追加されるので、再読み込みする
      setSibyl入力フォルダ('')
      setSibyl入力フォルダ(sibyl入力フォルダ)
    }
    setIs計算中(false)
  }, [
    is計算可能,
    lohdimLes有効,
    sibyl有効,
    exists,
    lohdimLes実行ファイル,
    lohdimLes入力フォルダ,
    sibyl入力フォルダ,
    sibyl実行ファイル,
    formData
  ])

  return {
    lohdimLes実行ファイル,
    sibyl実行ファイル,
    lohdimLes入力フォルダ,
    sibyl入力フォルダ,
    lohdimLes有効,
    sibyl有効,
    is計算可能,
    is計算中,          // 追加
    exists,
    extension,
    setLohdimLes実行ファイル,
    setSibyl実行ファイル,
    setLohdimLes有効,
    setSibyl有効,
    setLohdimLes入力フォルダ,
    setSibyl入力フォルダ,
    run計算
  }
}
