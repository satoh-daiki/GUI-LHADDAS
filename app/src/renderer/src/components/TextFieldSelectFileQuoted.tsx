import { Folder } from '@mui/icons-material'
import { IconButton, Stack, SxProps, TextField, TextFieldProps } from '@mui/material'

// ユーティリティ関数（必要に応じて共通ファイルからimportしてもOKですが、単体で動くようここに記述します）
export const pathBasename = (fullPath: string) => {
  // window.electronAPI.basename があればそれを使うのが確実ですが、
  // ここでは一般的なパス操作をシミュレートします。
  if (!fullPath) return ''
  const parts = fullPath.split(/[/\\]/)
  return parts.pop() || ''
}

/**
 * ファイル／フォルダ選択ボタン付きのテキストフィールド
 * 選択されたファイル名をシングルクオーテーションで囲んで入力します
 */
export function TextFieldSelectFileQuoted({
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
              ? // @ts-ignore window.tasksの型定義が必要です
                await window.tasks.openFileDialog(props.value as string, filters)
              : // @ts-ignore window.tasksの型定義が必要です
                await window.tasks.openFolderDialog(props.value as string)

          if (!path) return

          const fileName = pathBasename(path)

          // ファイル名をシングルクオーテーションで囲んでから onChangeText に渡す
          const quotedFileName = `'${fileName}'`
          onChangeText(quotedFileName)
        }}
      >
        <Folder />
      </IconButton>
    </Stack>
  )
}
