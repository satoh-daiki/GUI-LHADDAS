import { Entity } from 'resium'
import { 
    Color, 
    GridMaterialProperty,
    Rectangle,
    Math as CesiumMath,
} from 'cesium'
import { useEntity計算領域 } from '@renderer/hooks/components/Map/useEntity計算領域'
import { useAtomValue } from 'jotai';
import { atom建物オフセット } from '@renderer/hooks/atoms/atomsMap設定';
import { useCesium } from 'resium';
import { useEffect } from 'react';

/**
 * 計算タブ選択時の計算領域の可視化を行うコンポーネント
 */
export function Entity計算領域() {
  const { 計算領域, is地理院地図, show } = useEntity計算領域()
  const { x: offsetX, y: offsetY } = useAtomValue(atom建物オフセット);
  const { viewer } = useCesium()

  useEffect(() => {
    viewer?.scene.requestRender()
  }, [offsetX, offsetY, viewer])

  if (計算領域 === undefined || !show) return null

  const { rectangleLohdimLes, rectangleSibyl, xyGrid, zGrid } = 計算領域

  const getOffsettedRectangle = (originalRectangle: Rectangle, offsetX: number, offsetY: number) => {
    // 地球半径（メートル）
    const earthRadius = 6371000.0;

    // オフセットされた後の緯度・経度を計算するための初期値
    const newWestRad = originalRectangle.west;
    const newSouthRad = originalRectangle.south;
    const newEastRad = originalRectangle.east;
    const newNorthRad = originalRectangle.north;

    // 緯度方向のオフセット（ラジアン）
    const offsetLatRad = offsetY / earthRadius;
    const newSouthOffsetted = newSouthRad + offsetLatRad;
    const newNorthOffsetted = newNorthRad + offsetLatRad;

    // 経度方向のオフセット（ラジアン）
    // 緯度が高い場所では、経線間の距離が狭まるため cos(緯度) で調整
    // ここでは単純化のため、元の矩形の中心緯度を基準として計算
    const centerLatRad = (originalRectangle.south + originalRectangle.north) / 2;
    const offsetLonRad = offsetX / (earthRadius * Math.cos(centerLatRad));
    const newWestOffsetted = newWestRad + offsetLonRad;
    const newEastOffsetted = newEastRad + offsetLonRad;

    // 新しいRectangleオブジェクトを返す
    return new Rectangle(
      newWestOffsetted,
      newSouthOffsetted,
      newEastOffsetted,
      newNorthOffsetted
    );
  };

  // LOHDIM-LESのRectangleにオフセットを適用
  const offsettedRectangleLohdimLes = rectangleLohdimLes
    ? getOffsettedRectangle(rectangleLohdimLes, offsetX, offsetY)
    : undefined;
    
  // SIBYLのRectangleにオフセットを適用
  const offsettedRectangleSibyl = rectangleSibyl
    ? getOffsettedRectangle(rectangleSibyl, offsetX, offsetY)
    : undefined;
 

  return (
    <>
      {xyGrid && offsettedRectangleLohdimLes && (
        <>
          {/* LOHDIM-LES 計算領域 */}
          <Entity
            name="LOHDIM-LES 計算領域"
            rectangle={{
              coordinates: offsettedRectangleLohdimLes,
              extrudedHeight: zGrid ? zGrid.z.at(-1) : 0,
              outline: true,
              outlineColor: is地理院地図
                ? Color.MIDNIGHTBLUE.withAlpha(0.4)
                : Color.MIDNIGHTBLUE.withAlpha(0.4),
              material: Color.BLUE.withAlpha(0.0)
            }}
          />

          {/* XYグリッド */}
          <Entity
            name="X-Y グリッド"
            rectangle={{
              coordinates: offsettedRectangleLohdimLes,
              material: new GridMaterialProperty({
                lineCount: xyGrid,
                color: is地理院地図
                  ? Color.MIDNIGHTBLUE.withAlpha(0.2)
                  : Color.MIDNIGHTBLUE.withAlpha(0.2)
              })
            }}
          />
        </>
      )}
      {/* SIBYL 計算領域 */}
      {offsettedRectangleSibyl && (
        <Entity
          name="SIBYL 計算領域"
          rectangle={{
            coordinates: offsettedRectangleSibyl,
            material: Color.GREEN.withAlpha(is地理院地図 ? 0.3 : 0.3)
          }}
        />
      )}
    </>
  )
}

