import { Close } from '@mui/icons-material'
import { IconButton, Snackbar as MuiSnackbar, Slide } from '@mui/material'
import { useSnackbar } from '@renderer/hooks/useSnackbar'

/**
 * データファイルの読み込み失敗時に表示されるコンポーネント。
 */
export function Snackbar(): JSX.Element {
  const { handleClose, message, open } = useSnackbar()
  const action = (
    <IconButton size="small" color="inherit" onClick={handleClose}>
      <Close fontSize="small" />
    </IconButton>
  )

  return (
    <MuiSnackbar
      open={open}
      TransitionComponent={Slide}
      autoHideDuration={3000}
      onClose={handleClose}
      message={message}
      action={action}
    />
  )
}
