import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  atomMap設定_放出点経緯度,
  Type放出点経緯度ラベル,
  atomMap設定_放出点経緯度ラベル,
  atomMap設定_画像,
  atomMap設定_放出点セルラベル,
  atomMap設定_放出点セル,
  Type放出点セルラベル
} from '../../atoms/atomsMap設定'
import { useCallback } from 'react'
import { isNumeric } from '@renderer/utils/stringUtil'
import { atomGlobal_open地図設定 } from '@renderer/hooks/atoms/atomsGlobal'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { deriv放出点3D } from '@renderer/hooks/atoms/deriv放出点3D'

export function useMap設定() {
  const setMap放出点経緯度 = useSetAtom(atomMap設定_放出点経緯度)
  const setMap放出点セル = useSetAtom(atomMap設定_放出点セル)
  const [放出点経緯度ラベル, set放出点経緯度ラベル_] = useAtom(atomMap設定_放出点経緯度ラベル)
  const [放出点セルラベル, set放出点セルラベル_] = useAtom(atomMap設定_放出点セルラベル)
  const [画像, set画像] = useAtom(atomMap設定_画像)
  const open = useAtomValue(atomGlobal_open地図設定)
  const input = useAtomValue(deriv計算_入力)
  const 放出点 = useAtomValue(deriv放出点3D)

  const 高さ = 放出点?.高度
  const error緯度 = !is緯度(放出点経緯度ラベル.緯度)
  const error経度 = !is経度(放出点経緯度ラベル.経度)
  const errorX = !isInt(放出点セルラベル.x)
  const errorY = !isInt(放出点セルラベル.y)
  const errorZ = !isInt(放出点セルラベル.z)
  const disableSet放出点セル = input?.lohdimLes !== undefined
  const set放出点経緯度ラベル = useCallback(({ 緯度, 経度 }: Type放出点経緯度ラベル) => {
    set放出点経緯度ラベル_({ 緯度, 経度 })
    const isOk = is緯度(緯度) && is経度(経度)
    setMap放出点経緯度(isOk ? { 緯度: Number(緯度), 経度: Number(経度) } : undefined)
  }, [])
  const set放出点セルラベル = useCallback(
    ({ x, y, z }: Type放出点セルラベル) => {
      if (disableSet放出点セル) return
      set放出点セルラベル_({ x, y, z })
      const isOk = isInt(x) && isInt(y) && isInt(z)
      setMap放出点セル(isOk ? { x: Number(x), y: Number(y), z: Number(z) } : undefined)
    },
    [disableSet放出点セル]
  )

  return {
    open,
    disableSet放出点セル,
    放出点経緯度ラベル,
    放出点セルラベル,
    画像,
    高さ,
    error緯度,
    error経度,
    errorX,
    errorY,
    errorZ,
    set放出点経緯度ラベル,
    set放出点セルラベル,
    set画像
  }
}

function isInt(s: string) {
  if (!isNumeric(s)) return false
  const n = Number(s)
  return n === Math.trunc(n)
}

const is緯度 = (s: string) => isInside(-89, s, 89) // 計算領域を表示しているときに90度付近を設定するとエラーになる
const is経度 = (s: string) => isInside(-179, s, 179)
function isInside(min: number, s: string, max: number) {
  if (!isNumeric(s)) return false
  const n = Number(s)
  return min <= n && n <= max
}
