import { FormControlLabel, Switch } from '@mui/material'

/**
 * 可視化タブ用のスイッチ
 */
export function CustomSwitch({
  label,
  checked,
  width,
  disabled,
  hidden,
  onChange
}: {
  label: string
  checked: boolean
  width?: number
  disabled?: boolean
  hidden?: boolean
  onChange: (checked: boolean) => void
}): JSX.Element {
  return (
    <FormControlLabel
      sx={{ width, mx: 0, visibility: hidden ? 'hidden' : undefined }}
      disabled={disabled}
      label={<span style={{ fontSize: '0.95rem' }}>{label}</span>}
      control={
        <Switch size="small" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      }
    />
  )
}
