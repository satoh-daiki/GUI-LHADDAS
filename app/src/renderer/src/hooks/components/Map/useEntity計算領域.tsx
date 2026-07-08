import { useAtomValue } from 'jotai'
import { deriv計算領域 } from '../../atoms/deriv計算領域'
import { atomMap設定_画像 } from '../../atoms/atomsMap設定'
import { atomGlobal_tabName } from '../../atoms/atomsGlobal'
import { useCesium } from 'resium'
import { useEffect } from 'react'
import { atom建物オフセット } from '../../atoms/atomsMap設定'

export function useEntity計算領域() {
  const 計算領域 = useAtomValue(deriv計算領域)
  const map画像 = useAtomValue(atomMap設定_画像)
  const tabName = useAtomValue(atomGlobal_tabName)
  const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット)

  const is地理院地図 = map画像 === '地理院地図'
  const show = tabName !== '可視化タブ'

  // Cesiumの再描画
  const { viewer } = useCesium()
  useEffect(() => {
    viewer?.scene.requestRender()
  }, [viewer, 計算領域, is地理院地図, show, offsetX, offsetY])

  return {
    計算領域,
    is地理院地図,
    show
  }
}
