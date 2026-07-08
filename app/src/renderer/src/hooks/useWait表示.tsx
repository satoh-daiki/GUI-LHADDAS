import { useAtomValue } from 'jotai'
import { atomGlobal_is計算中, atomGlobal_is読込み中 } from './atoms/atomsGlobal'

export function useWait表示() {
  const is計算中 = useAtomValue(atomGlobal_is計算中)
  const is読込み中 = useAtomValue(atomGlobal_is読込み中)

  const isWaiting = is計算中 || is読込み中
  return { isWaiting }
}
