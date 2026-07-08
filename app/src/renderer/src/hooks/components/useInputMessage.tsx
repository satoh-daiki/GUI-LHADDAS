import {
  atomMap設定_放出点セル,
  atomMap設定_放出点経緯度
} from '@renderer/hooks/atoms/atomsMap設定'
import { deriv可視化_TimeSteps } from '@renderer/hooks/atoms/deriv可視化_TimeSteps'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { useApp } from '../useApp'

// フォルダパスのAtomをインポート
import { 
  atom計算_LohdimLes入力フォルダ, 
  atom計算_Sibyl入力フォルダ 
} from '@renderer/hooks/atoms/atoms計算タブ'

export function useMessage() {
  const {t} = useTranslation()
  const { tabIndex } = useApp()
  const 放出点 = useAtomValue(atomMap設定_放出点経緯度)
  const 放出点セル = useAtomValue(atomMap設定_放出点セル)
  const input = useAtomValue(deriv計算_入力)
  const steps = useAtomValue(deriv可視化_TimeSteps)


  // フォルダパスを取得
  const lohdimFolder = useAtomValue(atom計算_LohdimLes入力フォルダ)
  const sibylFolder = useAtomValue(atom計算_Sibyl入力フォルダ)

  //// 判定ロジック
  const hasLohdimFolder = (lohdimFolder ?? '').trim().length > 0
  const hasSibylFolder = (sibylFolder ?? '').trim().length > 0

  switch (tabIndex) {
    case 1: // LOHDIM入力タブ
      if (!hasLohdimFolder) {
        return 'lohdim_specify_input_folder'
      }
      break;

    case 2: // SIBYL入力タブ
      if (!hasSibylFolder) {
        return 'sibyl_specify_input_folder'
      }
      break;

    case 3: // 計算タブ
      if (!hasLohdimFolder && !hasSibylFolder) {
        return 'both_specify_input_folder'
      }
      break;
      
    default:
      return undefined;
  }
  return undefined

}
