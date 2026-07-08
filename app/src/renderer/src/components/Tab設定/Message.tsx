import { Box } from '@mui/material'
import { useMessage } from '@renderer/hooks/components/Tab可視化/useMessage'

/**
 * 可視化できないときにメッセージを出す
 */
export function Message() {
  const message = useMessage()
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        color: 'white',
        display: message ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        fontSize: '2rem',
        background: '#0005',
        opacity: message ? 1 : 0,
        transition: 'opacity 0.5s',
        '@starting-style': {
          opacity: 0
        }
      }}
    >
      {message}
    </Box>
  )
}
