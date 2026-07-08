import { Box, Popover, SxProps, TextField } from '@mui/material'
import { isNumeric } from '@renderer/utils/stringUtil'
import { useRef, useState } from 'react'

export function LabelWithPopover({
  label,
  isLeft,
  disabled,
  sx,
  onChange
}: {
  label: string
  isLeft?: boolean
  disabled?: boolean
  sx?: SxProps
  onChange: (v: number) => void
}) {
  const anchorEl = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const isInit = useRef(false)

  const handleClose = () => {
    isInit.current = false
    setOpen(false)
    if (text === label || !isNumeric(text)) return
    onChange(Number(text))
  }

  return (
    <Box
      sx={{
        flex: 1,
        textAlign: isLeft ? 'left' : 'right',
        ...sx
      }}
    >
      <Box
        ref={anchorEl}
        sx={
          disabled
            ? undefined
            : {
                width: 'fit-content', // クリック判定を広げないようにする
                display: 'inline-block',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                '&:hover': { textDecoration: 'underline' }
              }
        }
        onClick={() => {
          if (disabled) return
          isInit.current = false
          setOpen(true)
          setText(label)
        }}
      >
        {label}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        onClose={handleClose}
      >
        <TextField
          variant="standard"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            handleClose()
          }}
          sx={{ m: 1, width: 80 }}
          slotProps={{ input: { style: { fontSize: '0.9rem' } } }}
          inputRef={(ref) => {
            if (isInit.current) return
            ref?.focus()
            ref?.select()
            isInit.current = true
          }}
        />
      </Popover>
    </Box>
  )
}
