import { atom } from 'jotai'

export type TypeAxis = 'x' | 'y' | 'z'
export type TypeScale = 'linear' | 'log'

// time
export const atom可視化_timePosition = atom(0)
// slice
export const atom可視化_sliceChecked = atom(false)
export const atom可視化_slicePosition = atom(0)
export const atom可視化_sliceAxis = atom<TypeAxis>('x')
// 大気中濃度
export const atom可視化_大気中濃度Checked = atom(false)
export const atom可視化_大気中濃度Scale = atom<TypeScale>('linear')
export const atom可視化_大気中濃度Min = atom(0)
export const atom可視化_大気中濃度Middle = atom(0)
export const atom可視化_大気中濃度Max = atom(1)
export const atom可視化_大気中濃度MinLimit = atom(0)
export const atom可視化_大気中濃度MaxLimit = atom(1)
// 地表沈着濃度
export const atom可視化_地表沈着濃度Checked = atom(false)
export const atom可視化_地表沈着濃度Scale = atom<TypeScale>('linear')
export const atom可視化_地表沈着濃度Min = atom(0)
export const atom可視化_地表沈着濃度Max = atom(1)
export const atom可視化_地表沈着濃度MinLimit = atom(0)
export const atom可視化_地表沈着濃度MaxLimit = atom(1)
// 線量率
export const atom可視化_線量率Unit = atom('')
export const atom可視化_線量率Checked = atom(false)
export const atom可視化_線量率Scale = atom<TypeScale>('linear')
export const atom可視化_線量率Min = atom(0)
export const atom可視化_線量率Max = atom(1)
export const atom可視化_線量率MinLimit = atom(0)
export const atom可視化_線量率MaxLimit = atom(1)
