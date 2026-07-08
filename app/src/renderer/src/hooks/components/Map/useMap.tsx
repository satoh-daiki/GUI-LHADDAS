import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import {
  atomMap設定_放出点経緯度,
  atomMap設定_放出点経緯度ラベル,
  atomMap設定_画像,
  Type放出点経緯度
} from '../../atoms/atomsMap設定'
import { atomGlobal_open地図設定 } from '@renderer/hooks/atoms/atomsGlobal'

export function useMap() {
  const map画像 = useAtomValue(atomMap設定_画像)
  const setMap放出点経緯度 = useSetAtom(atomMap設定_放出点経緯度)
  const setMap放出点経緯度ラベル = useSetAtom(atomMap設定_放出点経緯度ラベル)
  const [open地図設定, setOpen地図設定] = useAtom(atomGlobal_open地図設定)

  const set放出点 = useCallback(({ 緯度, 経度 }: Type放出点経緯度) => {
    const 経緯度ラベル = { 緯度: 緯度.toFixed(6), 経度: 経度.toFixed(6) }
    setMap放出点経緯度ラベル(経緯度ラベル)
    setMap放出点経緯度({ 緯度, 経度 })
  }, [])
  const toggleOpen地図設定 = useCallback(() => {
    setOpen地図設定((prev) => !prev)
  }, [open地図設定])

  return {
    map画像,
    open地図設定,
    set放出点,
    toggleOpen地図設定
  }
}
