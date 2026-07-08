import { atom可視化_timePosition } from '@renderer/hooks/atoms/atoms可視化タブ'
import {
  deriv可視化_Data地表沈着濃度Reading,
  deriv可視化_Data大気中濃度Reading,
  deriv可視化_Data線量率Reading
} from '@renderer/hooks/atoms/deriv可視化_Data'
import { deriv可視化_TimeSteps } from '@renderer/hooks/atoms/deriv可視化_TimeSteps'
import { useAtom, useAtomValue } from 'jotai'

export function useTime() {
  const [position, setPosition] = useAtom(atom可視化_timePosition)
  const steps = useAtomValue(deriv可視化_TimeSteps)
  const reading大気中濃度 = useAtomValue(deriv可視化_Data大気中濃度Reading)
  const reading地表沈着濃度 = useAtomValue(deriv可視化_Data地表沈着濃度Reading)
  const reading線量率 = useAtomValue(deriv可視化_Data線量率Reading)

  const isReading = reading大気中濃度 || reading地表沈着濃度 || reading線量率
  const max = steps - 1

  return {
    max,
    position,
    isReading,
    setPosition
  }
}
