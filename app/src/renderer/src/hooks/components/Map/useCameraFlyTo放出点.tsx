import { useAtomValue } from 'jotai'
import { atomMap設定_放出点経緯度, atomMap設定_視点リセット } from '../../atoms/atomsMap設定'
import { useCallback, useRef } from 'react'
import { Cartesian3, Math as CesiumMath } from 'cesium'
import { deriv計算領域 } from '@renderer/hooks/atoms/deriv計算領域'

export function useCameraFlyTo放出点() {
  const map放出点経緯度 = useAtomValue(atomMap設定_放出点経緯度)
  const 視点リセット = useAtomValue(atomMap設定_視点リセット)
  const 計算領域 = useAtomValue(deriv計算領域)

  const refCamera緯度 = useRef(38) // 初期値は日本全体が表示されるようにしている
  const refCamera経度 = useRef(138)
  const refCamera高度 = useRef(3 * 1000 * 1000)
  const refCameraAutoMove = useRef(true)
  const ref視点リセット = useRef(視点リセット)

  let { 緯度, 経度 } = map放出点経緯度 ?? {}
  const rectangle = 計算領域?.rectangleLohdimLes ?? 計算領域?.rectangleSibyl
  if (rectangle) {
    経度 = CesiumMath.toDegrees((rectangle.west + rectangle.east) / 2)
    緯度 = CesiumMath.toDegrees((rectangle.north + rectangle.south) / 2)
  }

  const reset = ref視点リセット.current !== 視点リセット
  const changed =
    map放出点経緯度 && (refCamera緯度.current !== 緯度 || refCamera経度.current !== 経度 || reset)
  if (changed && 緯度 !== undefined && 経度 !== undefined) {
    const diff = Math.abs(refCamera緯度.current - 緯度) + Math.abs(refCamera経度.current - 経度)
    const move = reset || diff > 0.01
    refCamera緯度.current = 緯度
    refCamera経度.current = 経度
    ref視点リセット.current = 視点リセット
    if (move) {
      // ここに来たらカメラ位置が放出点に移動する
      refCamera高度.current = 5000
      refCameraAutoMove.current = true
    }
  }

  const destination = Cartesian3.fromDegrees(
    refCamera経度.current,
    refCamera緯度.current,
    refCamera高度.current
  )
  const duration = 1
  const once = !refCameraAutoMove.current
  const handleComplete = useCallback(() => {
    refCameraAutoMove.current = false
  }, [])

  return {
    duration,
    destination,
    once,
    handleComplete
  }
}
