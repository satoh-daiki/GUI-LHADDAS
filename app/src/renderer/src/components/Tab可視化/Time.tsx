import { Schedule } from '@mui/icons-material'
import { Box, Slider, Stack, Typography } from '@mui/material'
import { useTime } from '@renderer/hooks/components/Tab可視化/useTime'
import { LabelWithPopover } from '../common/LabelWithPopover'
import { useTranslation } from 'react-i18next'

/**
 * 時刻変更スライダー
 */
export function Time() {
  const {t} = useTranslation()
  const { position, max, isReading, setPosition } = useTime()

  return (
    <Stack direction="row" alignItems="center" paddingBottom={0.5}>
      <Schedule color="primary" sx={{ mb: '1px', mr: 0.25 }} />
      <Typography paddingRight={2}>{t("time_label")}：</Typography>
      <CunstomSlider
        value={position}
        min={0}
        max={max}
        disabled={false}
        onChange={(v) => {
          if (isReading) return
          if (v !== Math.trunc(v)) return
          if (v < 0 || max < v || v === position) return
          setPosition(v)
        }}
      />
    </Stack>
  )
}

/**
 * スライダー
 */
function CunstomSlider({
  value,
  min,
  max,
  disabled,
  onChange
}: {
  value: number
  min: number
  max: number
  disabled: boolean
  onChange: (value: number) => void
}) {
  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      <Slider
        color="secondary"
        disabled={disabled}
        value={value}
        min={min}
        max={max}
        sx={{ display: 'block' }}
        onChange={(_, value) => onChange(value as number)}
      />
      <LabelWithPopover
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          mb: -1.5,
          fontSize: '0.75rem',
          opacity: disabled ? 0.5 : 1,
          fontFamily: 'monospace'
        }}
        label={`${value}`.padStart(3, '0')}
        disabled={disabled}
        onChange={onChange}
      />
    </Box>
  )
}
