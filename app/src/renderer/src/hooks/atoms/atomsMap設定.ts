import { atom } from 'jotai'

export type Type放出点経緯度 = { 緯度: number; 経度: number }
export type Type放出点経緯度ラベル = { 緯度: string; 経度: string }
export type Type放出点セル = { x: number; y: number; z: number }
export type Type放出点セルラベル = { x: string; y: string; z: string }
export type Type画像 = '地理院地図' | 'OpenStreetMap'

/**
 * 放出点経緯度
 */
export const atomMap設定_放出点経緯度 = atom<Type放出点経緯度 | undefined>(undefined)

/**
 * 放出点経緯度ラベル
 */
export const atomMap設定_放出点経緯度ラベル = atom<Type放出点経緯度ラベル>({
  緯度: '',
  経度: ''
})

/**
 * 放出点セル
 */
export const atomMap設定_放出点セル = atom<Type放出点セル | undefined>({ x: 0, y: 0, z: 1 })

/**
 * 放出点セルラベル
 */
export const atomMap設定_放出点セルラベル = atom<Type放出点セルラベル>({
  x: '1',
  y: '1',
  z: '1'
})

/**
 * 表示される地図画像の種類
 */
export const atomMap設定_画像 = atom<Type画像>('地理院地図')

/**
 * この値が更新されると視点がリセットされる
 */
export const atomMap設定_視点リセット = atom(0)

/**
 * 建物の描画オフセットを管理する
 */
export const atom建物オフセット = atom({x: 0, y: 0})

/**
 * 計算結果の描画位置を移動させるときの移動量(m) 
 */
export const atom計算結果移動量 = atom({x: 0, y: 0})

export const atomMapエラー通知 = atom<{ message: string; type: 'success' | 'error' | 'warning' } | undefined>(undefined)
