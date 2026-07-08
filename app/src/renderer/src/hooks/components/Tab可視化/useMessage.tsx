import {
  atomMap設定_放出点セル,
  atomMap設定_放出点経緯度
} from '@renderer/hooks/atoms/atomsMap設定'
import { deriv可視化_TimeSteps } from '@renderer/hooks/atoms/deriv可視化_TimeSteps'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'

export function useMessage() {
  const {t} = useTranslation()
  const 放出点 = useAtomValue(atomMap設定_放出点経緯度)
  const 放出点セル = useAtomValue(atomMap設定_放出点セル)
  const input = useAtomValue(deriv計算_入力)
  const steps = useAtomValue(deriv可視化_TimeSteps)
  if (!input?.lohdimLes && !input?.sibyl) return t("specify_input_folder")
  if (steps === 0) return t("no_output_data")
  if (!放出点 || !放出点セル) return t("set_emission_point")
  return undefined
}
