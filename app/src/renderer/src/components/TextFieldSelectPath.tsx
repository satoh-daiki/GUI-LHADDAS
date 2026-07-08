import { Folder } from '@mui/icons-material'
import { IconButton, Stack, SxProps, TextField, TextFieldProps } from '@mui/material'

/**
 * ファイル／フォルダ選択ボタン付きのテキストフィールド
 */
export function TextFieldSelectPath({
  filterName,
  filterExtension,
  type,
  onChangeText,
  stackSx,
  ...props
}: {
  filterName?: string
  filterExtension?: string
  type: 'file' | 'folder'
  stackSx?: SxProps
  onChangeText: (text: string) => void
} & TextFieldProps): JSX.Element {
  return (
    <Stack direction="row" alignItems="end" sx={stackSx}>
      <TextField
        onChange={(event) => onChangeText(event.target.value)}
        slotProps={{ htmlInput: { style: { fontSize: '0.9rem' } } }}
        size="small"
        multiline
        {...props}
        error={props.disabled ? undefined : props.error}
      />
      <IconButton
        disabled={props.disabled}
        color="primary"
        sx={{
          width: 32,
          height: 32,
          ml: -4,
          mb: '2px',
          background: 'white',
          visibility: 'hidden',
          '&:hover': { background: 'whitesmoke' },
          'div:hover > &': { visibility: props.disabled ? 'hidden' : 'visible' }
        }}
        onClick={async () => {
          const filters =
            filterName && filterExtension
              ? [{ name: filterName, extensions: [filterExtension] }]
              : undefined
          const path =
            type === 'file'
              ? await window.tasks.openFileDialog(props.value as string, filters)
              : await window.tasks.openFolderDialog(props.value as string)
          if (!path) return
          onChangeText(path)
        }}
      >
        <Folder />
      </IconButton>
    </Stack>
  )
}
