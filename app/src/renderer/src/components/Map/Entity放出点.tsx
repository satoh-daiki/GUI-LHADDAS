import { useEntity放出点 } from '@renderer/hooks/components/Map/useEntity放出点'
import { Cartesian3, Color, HeightReference, Math as CesiumMath } from 'cesium'
import { memo } from 'react'
import { Entity } from 'resium'
import { useAtomValue } from 'jotai'
import { atom建物オフセット } from '@renderer/hooks/atoms/atomsMap設定'

export const Entity放出点 = memo(Entity放出点_)

function Entity放出点_() {
  const { hidden, 放出点 } = useEntity放出点()
  const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット)

  if (hidden || 放出点 === undefined) return null

  const earthRadius = 6371000.0;
  const latRad = CesiumMath.toRadians(放出点.緯度);
  const lonRad = CesiumMath.toRadians(放出点.経度);

  // 緯度方向のオフセット
  const newLatRad = latRad + (offsetY / earthRadius);
  // 経度方向のオフセット
  const newLonRad = lonRad + (offsetX / (earthRadius * Math.cos(latRad)));

  const 高度 = 放出点.高度 ?? 0

  // 計算後のラジアンを使って座標を作成
  const position = Cartesian3.fromRadians(newLonRad, newLatRad, 高度)
  const positionGround = Cartesian3.fromRadians(newLonRad, newLatRad, 0)

  // 入力された緯度経度をそのまま使う
  //const position = Cartesian3.fromDegrees(放出点.経度, 放出点.緯度, 高度)

  return (
    <>
      {/* 空中の赤い点 */}
      <Entity
        name="放出点"
        position={position}
        point={{
          pixelSize: 10,
          color: Color.RED,
          heightReference: HeightReference.RELATIVE_TO_GROUND
        }}
      />
      
      {/* 地上の赤い点（影のようなもの） */}
      {高度 > 2 && (
        <Entity
          name="放出点（地上）"
          position={positionGround}
          point={{
            pixelSize: 5,
            color: Color.DARKRED,
            // 地面にピタッと張り付ける
            heightReference: HeightReference.CLAMP_TO_GROUND
          }}
        />
      )}
    </>
  )
}
