import { CircularProgress, Modal } from '@mui/material'
import { useWait表示 } from '@renderer/hooks/useWait表示'

/**
 * 計算処理中に画面を操作できなくするコンポーネント。
 * 有効／無効の切り替えは`startWaitAtom, endWaitAtom`を使う。
 */
export function Wait表示(): JSX.Element {
  const { isWaiting } = useWait表示()
  return (
    <Modal
      open={isWaiting}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <CircularProgress size="5rem" sx={{ color: 'white' }} {...{ inert: '' }} />
    </Modal>
  )
}
