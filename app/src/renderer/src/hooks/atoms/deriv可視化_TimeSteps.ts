import { atom } from 'jotai'
import { deriv計算_paths出力 } from './deriv計算_path'
import { atomInputRefreshTrigger } from './deriv計算_入力';

/**
 * 出力データの数を持つ derived atom
 */
export const deriv可視化_TimeSteps = atom((get) => {
  get(atomInputRefreshTrigger);

  const paths = get(deriv計算_paths出力)
  if (!paths) return 0
  return Object.keys(paths).length
})
