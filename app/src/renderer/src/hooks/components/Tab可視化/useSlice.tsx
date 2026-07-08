import { useAtom, useAtomValue } from 'jotai'
import {
  atom可視化_sliceAxis,
  atom可視化_sliceChecked,
  atom可視化_slicePosition,
  atom可視化_大気中濃度Checked,
  TypeAxis
} from '../../atoms/atoms可視化タブ'
import { useCallback } from 'react'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { atomMap設定_放出点セル } from '@renderer/hooks/atoms/atomsMap設定'
import { Mesh } from '@renderer/Input'

export function useSlice() {
  const [checked, setChecked] = useAtom(atom可視化_sliceChecked)
  const [position, setPosition] = useAtom(atom可視化_slicePosition)
  const [axis, setAxis_] = useAtom(atom可視化_sliceAxis)
  const input = useAtomValue(deriv計算_入力)
  const 放出点 = useAtomValue(atomMap設定_放出点セル)
  const 大気中濃度Checked = useAtomValue(atom可視化_大気中濃度Checked)
  let min = 0
  let max = 0
  const mesh: Mesh | undefined = input?.lohdimLes ?? input?.sibyl
  if (input && 放出点 && mesh) {
    const { nx, ny, cellSize, zData } = mesh
    // 放出点は1始まりなので注意
    if (axis === 'z') {
      min = -Math.ceil((zData[放出点.z - 1] + zData[放出点.z]) / 2)
      max = Math.ceil((zData.at(-1) ?? 0) - min)
    } else {
      const l = (axis === 'x' ? nx : ny) * cellSize
      const left = ((axis === 'x' ? 放出点.x : 放出点.y) - 0.5) * cellSize
      const right = l - left
      min = -Math.ceil(left)
      max = Math.ceil(right)
    }
  }
  const disabled = !大気中濃度Checked

  const setAxis = useCallback((axis: TypeAxis) => {
    setAxis_(axis)
    setPosition(0)
  }, [])

  return {
    disabled,
    checked,
    axis,
    position,
    min,
    max,
    setChecked,
    setAxis,
    setPosition
  }
}
