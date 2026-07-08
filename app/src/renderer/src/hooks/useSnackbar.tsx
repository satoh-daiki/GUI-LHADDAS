import { SnackbarCloseReason } from '@mui/material'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { atomGlobal_snackbar } from './atoms/atomsGlobal'

export function useSnackbar() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useAtom(atomGlobal_snackbar)
  const handleClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return
    setOpen(false)
    setMessage(undefined)
  }
  useEffect(() => setOpen(!!message), [message])

  return {
    open,
    message,
    handleClose
  }
}
