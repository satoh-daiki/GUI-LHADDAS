import { useToggle線量率 } from '@renderer/hooks/components/Tab可視化/useToggle'
import { Toggle表示データ } from './Toggle表示データ'
import { useTranslation } from 'react-i18next' 

export function Toggle線量率(): JSX.Element {
  const {t} = useTranslation();

  const {
    unit,
    disabled,
    checked,
    scale,
    value,
    minLimit,
    maxLimit,
    setChecked,
    setScale,
    setValue
  } = useToggle線量率()

  return (
    <Toggle表示データ
      label={t("dose_rate_label")}
      switchWidth={150}
      disabled={disabled}
      unit={unit}
      checked={checked}
      scale={scale}
      value={value}
      minLimit={minLimit}
      maxLimit={maxLimit}
      setChecked={setChecked}
      setScale={setScale}
      setValue={setValue}
    />
  )
}
