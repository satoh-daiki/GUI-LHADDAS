import { Box } from '@mui/material'
import { useMessage } from '@renderer/hooks/components/useInputMessage'
import { useTranslation } from 'react-i18next'

/**
 * 可視化できないときにメッセージを出す
 */
export function Message() {
  const messageKey = useMessage()
  const { t } = useTranslation()

  const show = messageKey === 'lohdim_specify_input_folder'

  let message = undefined

  if (messageKey === 'both_specify_input_folder') {
    message = t('specify_input_folder')
  }

  if (messageKey === 'sibyl_specify_input_folder') {
    message = t('specify_input_folder')
  }

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
        },
        zIndex: '10000'
      }}
    >
      {message}
    </Box>
  )
}
