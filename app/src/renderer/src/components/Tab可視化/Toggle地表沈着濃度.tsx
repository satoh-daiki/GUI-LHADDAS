import { useToggle地表沈着濃度 } from '@renderer/hooks/components/Tab可視化/useToggle'
import { Toggle表示データ } from './Toggle表示データ'
import { useTranslation } from 'react-i18next'

export function Toggle地表沈着濃度(): JSX.Element {
  const {t} = useTranslation() as {t: T};

  const { disabled, checked, scale, value, minLimit, maxLimit, setChecked, setScale, setValue } =
    useToggle地表沈着濃度()

  return (
    <Toggle表示データ
      label={t("surface_deposition_concentration_label")}
      switchWidth={150}
      disabled={disabled}
      unit={'Bq/m²'}
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
