import { Box, Slider, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { toString } from '@renderer/utils/stringUtil'
import { CustomSwitch } from './CustomSwitch'
import { TypeScale } from '@renderer/hooks/atoms/atoms可視化タブ'
import { LabelWithPopover } from '../common/LabelWithPopover'
import { useTranslation } from 'react-i18next'

export function Toggle表示データ({
  label,
  switchWidth,
  disabled,
  unit,
  checked,
  scale,
  value,
  minLimit,
  maxLimit,
  setChecked,
  setScale,
  setValue
}: {
  label: string
  switchWidth: number
  disabled: boolean
  unit: string
  checked: boolean
  scale: TypeScale
  value: number[]
  minLimit: number
  maxLimit: number
  setChecked: (v: boolean) => void
  setScale: (type: TypeScale) => void
  setValue: (value: number[]) => void
}): JSX.Element {
  const [toRatio, fromRatio]: [(v: number) => number, (v: number) => number] =
    minLimit == maxLimit
      ? [() => 0, () => minLimit]
      : scale === 'linear'
        ? [
            (v) => (v - minLimit) / (maxLimit - minLimit),
            (r) => minLimit + r * (maxLimit - minLimit)
          ]
        : [
            (v) => (Math.log(v) - Math.log(minLimit)) / (Math.log(maxLimit) - Math.log(minLimit)),
            (r) => Math.exp(Math.log(minLimit) + r * (Math.log(maxLimit) - Math.log(minLimit)))
          ]
  return (
    <Stack direction="row" alignItems="center" paddingRight={1}>
      {/* 表示／非表示 */}
      <CustomSwitch
        width={switchWidth}
        label={label}
        checked={checked}
        disabled={disabled}
        onChange={setChecked}
      />

      {/* 線形／対数 */}
      <CumstomToggle scale={scale} disabled={!checked} onChange={setScale} />

      {/* スライダー */}
      <CunstomSlider
        unit={unit}
        value={value}
        toRatio={toRatio}
        fromRatio={fromRatio}
        disabled={!checked}
        onValueChange={setValue}
      />
    </Stack>
  )
}

/**
 * 線形／対数トグル
 */
function CumstomToggle({
  disabled,
  scale: type,
  onChange
}: {
  scale: TypeScale
  disabled: boolean
  onChange: (type: TypeScale) => void
}): JSX.Element {
  const {t} = useTranslation()

  return (
    <ToggleButtonGroup
      exclusive
      color={disabled ? 'standard' : 'primary'}
      size="small"
      value={'target'}
      disabled={disabled}
      onClick={() => {
        onChange(type === 'linear' ? 'log' : 'linear')
      }}
      onChange={(_, val) => {
        if (val === null) return // 選択を解除できなくする
      }}
    >
      <ToggleButton value="target" sx={{ whiteSpace: 'nowrap' }}>
        {type === 'linear' ? t("linear_scale") : t("log_scale")}
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

/**
 * スライダー
 */
function CunstomSlider({
  unit,
  value,
  disabled,
  toRatio,
  fromRatio,
  onValueChange
}: {
  unit: string
  value: number[]
  disabled: boolean
  toRatio: (value: number) => number
  fromRatio: (ratio: number) => number
  onValueChange: (value: number[]) => void
}): JSX.Element {
  const handleChange = (v: number, index: number) => {
    const val = [...value]
    val[index] = v
    onValueChange(val)
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        position: 'relative',
        ml: 2.5
      }}
    >
      <Slider
        size="small"
        disabled={disabled}
        value={value.map(toRatio)}
        min={0}
        max={1}
        step={0.001}
        onChange={(_, val, thumb) => {
          if (!Array.isArray(val)) return
          const newVal = [...value]
          if (val.length === 3 && val[0] !== val[1] && Math.abs(val[0] - val[1]) < 0.05) {
            val[thumb] = val[(thumb + 1) % 2]
          }
          newVal[thumb] = fromRatio(val[thumb])
          onValueChange(newVal)
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          mb: -0.5,
          display: 'flex',
          gap: 0.5,
          fontSize: '0.75rem',
          opacity: disabled ? 0.5 : 1,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap'
        }}
      >
        <LabelWithPopover
          isLeft={true}
          label={toString(value[0])}
          disabled={disabled}
          onChange={(min) => handleChange(min, 0)}
        />
        {value.length === 3 && (
          <LabelWithPopover
            isLeft={true}
            label={toString(value[1])}
            disabled={disabled}
            onChange={(mid) => handleChange(mid, 1)}
          />
        )}
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'auto' }}>{unit}</span>
        <LabelWithPopover
          isLeft={false}
          label={toString(value.at(-1))}
          disabled={disabled}
          onChange={(max) => handleChange(max, value.length - 1)}
        />
      </Box>
    </Box>
  )
}
