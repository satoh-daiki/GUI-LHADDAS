import { Tasks } from '../Tasks'
import { fileExists } from './fileExists'
import { getOutputLohdimLes2D } from './getOutputLohdimLes2D'

/**
 * SIBYLの出力データを取得する
 */
export const getOutputSibyl2D: Tasks['getOutputSibyl2D'] = async (
  path: string,
  nx: number,
  ny: number
) => {
  if (!(await fileExists(path))) return Promise.resolve(null)
  return getOutputLohdimLes2D(path, nx, ny)
}


