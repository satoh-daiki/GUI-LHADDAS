import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
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
  atom可視化_線量率Unit,
  TypeScale
} from '../../atoms/atoms可視化タブ'
import { useCallback, useMemo } from 'react'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { minValue } from '@renderer/Output'

export function useToggle大気中濃度() {
  const [checked, setChecked0] = useAtom(atom可視化_大気中濃度Checked)
  const setChecked地表沈着濃度 = useSetAtom(atom可視化_地表沈着濃度Checked)
  const setChecked線量率 = useSetAtom(atom可視化_線量率Checked)
  const [scale, setScale0] = useAtom(atom可視化_大気中濃度Scale)
  const [min, setMin] = useAtom(atom可視化_大気中濃度Min)
  const [middle, setMiddle] = useAtom(atom可視化_大気中濃度Middle)
  const [max, setMax] = useAtom(atom可視化_大気中濃度Max)
  const minLimit = useAtomValue(atom可視化_大気中濃度MinLimit)
  const maxLimit = useAtomValue(atom可視化_大気中濃度MaxLimit)
  const input = useAtomValue(deriv計算_入力)

  const disabled = !input?.lohdimLes && !input?.sibyl
  const setChecked = useCallback(
    funcSetChecked(setChecked0, setChecked地表沈着濃度, setChecked線量率),
    []
  )
  const setValue = useCallback(funcSetValue(scale, setMin, setMax, setMiddle), [scale])
  const setScale = useCallback(funcSetScale(min, minLimit, setScale0, setMin, setMiddle), [
    min,
    minLimit
  ])
  const value = useMemo(() => [min, middle, max], [min, middle, max])

  return {
    disabled,
    checked,
    scale,
    value,
    minLimit,
    maxLimit,
    setChecked,
    setScale,
    setValue
  }
}

export function useToggle地表沈着濃度() {
  const [checked, setChecked0] = useAtom(atom可視化_地表沈着濃度Checked)
  const setChecked大気中濃度 = useSetAtom(atom可視化_大気中濃度Checked)
  const setChecked線量率 = useSetAtom(atom可視化_線量率Checked)
  const [scale, setScale0] = useAtom(atom可視化_地表沈着濃度Scale)
  const [min, setMin] = useAtom(atom可視化_地表沈着濃度Min)
  const [max, setMax] = useAtom(atom可視化_地表沈着濃度Max)
  const minLimit = useAtomValue(atom可視化_地表沈着濃度MinLimit)
  const maxLimit = useAtomValue(atom可視化_地表沈着濃度MaxLimit)
  const input = useAtomValue(deriv計算_入力)

  const disabled = !input?.lohdimLes && !input?.sibyl
  const setChecked = useCallback(
    funcSetChecked(setChecked0, setChecked大気中濃度, setChecked線量率),
    []
  )
  const setValue = useCallback(funcSetValue(scale, setMin, setMax), [scale])
  const setScale = useCallback(funcSetScale(min, minLimit, setScale0, setMin), [min, minLimit])
  const value = useMemo(() => [min, max], [min, max])

  return {
    disabled,
    checked,
    scale,
    value,
    minLimit,
    maxLimit,
    setChecked,
    setScale,
    setValue
  }
}

export function useToggle線量率() {
  const unit = useAtomValue(atom可視化_線量率Unit)
  const [checked, setChecked0] = useAtom(atom可視化_線量率Checked)
  const setChecked大気中濃度 = useSetAtom(atom可視化_大気中濃度Checked)
  const setChecked地表沈着濃度 = useSetAtom(atom可視化_地表沈着濃度Checked)
  const [scale, setScale0] = useAtom(atom可視化_線量率Scale)
  const [min, setMin] = useAtom(atom可視化_線量率Min)
  const [max, setMax] = useAtom(atom可視化_線量率Max)
  const minLimit = useAtomValue(atom可視化_線量率MinLimit)
  const maxLimit = useAtomValue(atom可視化_線量率MaxLimit)
  const input = useAtomValue(deriv計算_入力)

  const disabled = input?.sibyl === undefined
  const setChecked = useCallback(
    funcSetChecked(setChecked0, setChecked大気中濃度, setChecked地表沈着濃度),
    []
  )
  const setValue = useCallback(funcSetValue(scale, setMin, setMax), [scale])
  const setScale = useCallback(funcSetScale(min, minLimit, setScale0, setMin), [min, minLimit])
  const value = useMemo(() => [min, max], [min, max])

  return {
    disabled,
    unit,
    checked,
    scale,
    value,
    minLimit,
    maxLimit,
    setChecked,
    setScale,
    setValue
  }
}

type setter<T> = (v: T) => void

function funcSetChecked(
  setChecked: setter<boolean>,
  unsetChecked1: setter<boolean>,
  unsetChecked2: setter<boolean>
) {
  return (v: boolean) => {
    setChecked(v)
    if (v === true) {
      unsetChecked1(false)
      unsetChecked2(false)
    }
  }
}

function funcSetValue(
  scale: TypeScale,
  setMin: setter<number>,
  setMax: setter<number>,
  setMiddle?: setter<number>
) {
  return (value: number[]) => {
    if (setMiddle) {
      if (value.length !== 3) return
      if (value[0] >= value[2] || value[1] >= value[2]) return
      if (value[0] !== 0) {
        // VoxelPrimitiveで表示できるのはfloatデータなので、minValue3Dより小さい値を設定できないようにする
        value[0] = Math.max(value[0], minValue)
        value[1] = Math.max(value[1], minValue)
      }
      if (value[0] > value[1]) {
        value[1] = value[0]
      }
    } else {
      if (value.length !== 2) return
      if (value[0] >= value[1]) return
      if (value[0] !== 0) {
        value[0] = Math.max(value[0], minValue) // 必要ではないが、3Dデータの場合と合わせることでユーザーが混乱させないようにする
      }
    }
    if (scale === 'linear' && value[0] < 0) return
    if (scale === 'log' && value[0] <= 0) return
    setMin(value[0])
    setMiddle?.(value[1])
    setMax(value.at(-1)!)
  }
}

function funcSetScale(
  min: number,
  minLimit: number,
  setScale: setter<TypeScale>,
  setMin: setter<number>,
  setMiddle?: setter<number>
) {
  return (scale: TypeScale) => {
    setScale(scale)
    if (scale === 'log' && min <= 0.0) {
      setMin(minLimit)
      setMiddle?.(minLimit)
    }
  }
}
