import { useToggle大気中濃度 } from '@renderer/hooks/components/Tab可視化/useToggle'
import { Toggle表示データ } from './Toggle表示データ'
import { useTranslation } from 'react-i18next'

export function Toggle大気中濃度(): JSX.Element {
  const {t} = useTranslation()
  const { disabled, checked, scale, value, minLimit, maxLimit, setChecked, setScale, setValue } =
    useToggle大気中濃度()

  return (
    <Toggle表示データ
      label={t("atmospheric_concentration_label")}
      switchWidth={140}
      disabled={disabled}
      unit={'Bq/m³'}
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
