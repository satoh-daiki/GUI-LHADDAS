import { Box, Slider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { CustomSwitch } from './CustomSwitch'
import { useSlice } from '@renderer/hooks/components/Tab可視化/useSlice'
import { TypeAxis } from '@renderer/hooks/atoms/atoms可視化タブ'
import { LabelWithPopover } from '../common/LabelWithPopover'
import { useTranslation } from 'react-i18next'

export function Slice({ switchWidth }: { switchWidth: number }) {
  const {t} = useTranslation()
  const { disabled, axis, max, min, position, checked, setAxis, setChecked, setPosition } =
    useSlice()

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center">
        {/* スライスの表示／非表示 */}
        <CustomSwitch
          width={switchWidth}
          label={t("slice_label")}
          disabled={disabled}
          hidden={disabled}
          checked={checked}
          onChange={setChecked}
        />
        {/* 軸 */}
        <CumstomToggle axis={axis} hidden={disabled || !checked} onChange={setAxis} />
      </Stack>
      {/* スライダー */}
      <Box paddingLeft={`${switchWidth}px`}>
        <CunstomSlider
          value={position}
          min={min}
          max={max}
          hidden={disabled || !checked}
          onChange={(v) => {
            if (v < min || max < v || v === position) return
            setPosition(v)
          }}
        />
      </Box>
    </Stack>
  )
}

/**
 * トグル
 */
function CumstomToggle({
  hidden,
  axis,
  onChange
}: {
  axis: TypeAxis
  hidden: boolean
  onChange: (axis: TypeAxis) => void
}): JSX.Element {
  const {t} = useTranslation()
  return (
    <ToggleButtonGroup
      exclusive
      color={hidden ? 'standard' : 'primary'}
      size="small"
      value={axis}
      sx={{ visibility: hidden ? 'hidden' : undefined }}
      onChange={(_, type) => {
        if (type === null) return // 選択を解除できなくする
        onChange(type)
      }}
    >
      <ToggleButton value="x" sx={{ whiteSpace: 'nowrap' }}>
        {t("x_axis")}
      </ToggleButton>
      <ToggleButton value="y" sx={{ whiteSpace: 'nowrap' }}>
        {t("y_axis")}
      </ToggleButton>
      <ToggleButton value="z" sx={{ whiteSpace: 'nowrap' }}>
        {t("z_axis")}
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

/**
 * スライダー
 */
function CunstomSlider({
  value,
  min,
  max,
  hidden,
  onChange
}: {
  value: number
  min: number
  max: number
  hidden: boolean
  onChange: (value: number) => void
}): JSX.Element {
  const sx = {
    position: 'absolute',
    bottom: 0,
    mb: -0.5,
    fontSize: '0.75rem',
    fontFamily: 'monospace'
  }
  return (
    <Box sx={{ flexGrow: 1, position: 'relative', visibility: hidden ? 'hidden' : undefined }}>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        marks={[{ value: 0 }]}
        track={false}
        onChange={(_, value) => onChange(value as number)}
      />
      <LabelWithPopover
        sx={{ right: 12, ...sx }}
        label={`${Math.round(value)}`}
        disabled={hidden}
        onChange={onChange}
      />
      <Typography sx={{ right: 0, ...sx }}>m</Typography>
    </Box>
  )
}
