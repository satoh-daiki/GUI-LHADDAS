import { atom } from 'jotai'
import {
  atom可視化_sliceAxis,
  atom可視化_sliceChecked,
  atom可視化_slicePosition,
  atom可視化_timePosition,
  atom可視化_地表沈着濃度Checked,
  atom可視化_地表沈着濃度Max,
  atom可視化_地表沈着濃度MaxLimit,
  atom可視化_地表沈着濃度Min,
  atom可視化_地表沈着濃度MinLimit,
  atom可視化_地表沈着濃度Scale,
  atom可視化_大気中濃度Checked,
  atom可視化_大気中濃度Max,
  atom可視化_大気中濃度MaxLimit,
  atom可視化_大気中濃度Middle,
  atom可視化_大気中濃度Min,
  atom可視化_大気中濃度MinLimit,
  atom可視化_大気中濃度Scale,
  atom可視化_線量率Checked,
  atom可視化_線量率Max,
  atom可視化_線量率MaxLimit,
  atom可視化_線量率Min,
  atom可視化_線量率MinLimit,
  atom可視化_線量率Scale,
  atom可視化_線量率Unit
} from './atoms可視化タブ'

export const DEFAULT_MINMAX = 0

/**
 * 可視化タブのパラメータをリセットする derived atom
 */
export const deriv可視化_Reset = atom(null, (_get, set) => {
  set(atom可視化_timePosition, 0)
  set(atom可視化_大気中濃度Checked, false)
  set(atom可視化_大気中濃度Scale, 'log')
  set(atom可視化_大気中濃度Min, DEFAULT_MINMAX)
  set(atom可視化_大気中濃度Middle, DEFAULT_MINMAX)
  set(atom可視化_大気中濃度Max, DEFAULT_MINMAX)
  set(atom可視化_大気中濃度MinLimit, DEFAULT_MINMAX)
  set(atom可視化_大気中濃度MaxLimit, DEFAULT_MINMAX)
  set(atom可視化_地表沈着濃度Checked, false)
  set(atom可視化_地表沈着濃度Scale, 'log')
  set(atom可視化_地表沈着濃度Min, DEFAULT_MINMAX)
  set(atom可視化_地表沈着濃度Max, DEFAULT_MINMAX)
  set(atom可視化_地表沈着濃度MinLimit, DEFAULT_MINMAX)
  set(atom可視化_地表沈着濃度MaxLimit, DEFAULT_MINMAX)
  set(atom可視化_線量率Checked, false)
  set(atom可視化_線量率Unit, '-')
  set(atom可視化_線量率Scale, 'log')
  set(atom可視化_線量率Min, DEFAULT_MINMAX)
  set(atom可視化_線量率Max, DEFAULT_MINMAX)
  set(atom可視化_線量率MinLimit, DEFAULT_MINMAX)
  set(atom可視化_線量率MaxLimit, DEFAULT_MINMAX)
  set(atom可視化_sliceChecked, false)
  set(atom可視化_sliceAxis, 'x')
  set(atom可視化_slicePosition, 0)
})
