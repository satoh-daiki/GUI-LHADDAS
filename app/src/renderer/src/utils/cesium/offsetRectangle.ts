import { Rectangle } from 'cesium'

/**
 * Cesium の Rectangle(経緯度・ラジアン) に対して、ローカルENU座標系のメートルオフセットを適用する。
 *
 * - offsetX: 東方向(m)
 * - offsetY: 北方向(m)
 *
 * 既存の Entity計算領域.tsx と同じ近似（地球半径 + 中心緯度 cos 補正）で変換する。
 */
export function offsetRectangleMeters(
  original: Rectangle,
  offsetX: number,
  offsetY: number
): Rectangle {
  const earthRadius = 6371000.0

  // 緯度方向（北が+）
  const offsetLatRad = offsetY / earthRadius
  const newSouth = original.south + offsetLatRad
  const newNorth = original.north + offsetLatRad

  // 経度方向（東が+）: 緯度によって距離が変わるため cos(緯度) で補正
  const centerLatRad = (original.south + original.north) / 2
  const offsetLonRad = offsetX / (earthRadius * Math.cos(centerLatRad))
  const newWest = original.west + offsetLonRad
  const newEast = original.east + offsetLonRad

  return new Rectangle(newWest, newSouth, newEast, newNorth)
}
