import { useCameraFlyTo放出点 } from '@renderer/hooks/components/Map/useCameraFlyTo放出点'
import { CameraFlyTo } from 'resium'

/**
 * カメラ位置の自動変更コンポーネント
 */
export function CameraFlyTo放出点() {
  const { duration, destination, once, handleComplete } = useCameraFlyTo放出点()

  return (
    <CameraFlyTo
      duration={duration}
      destination={destination}
      once={once}
      onComplete={handleComplete}
    />
  )
}
