import { atom } from 'jotai'
import { Cartographic, EllipsoidGeodesic, Math as CesiumMath, Rectangle, Cartesian2 } from 'cesium'
import { atomMap設定_放出点セル, atomMap設定_放出点経緯度, Type放出点セル } from './atomsMap設定'
import { Input, Range } from '@renderer/Input'
import { deriv計算_入力 } from './deriv計算_入力'

export interface Type計算領域 {
  zGrid?: {
    z: number[]
    min経度: number
    max経度: number
    緯度: number
  }
  xyGrid?: Cartesian2
  rectangleLohdimLes?: Rectangle
  rectangleSibyl?: Rectangle
}

/**
 * 入力ファイルから得られる計算領域を持つ derived atom
 */
export const deriv計算領域 = atom((get) => {
  const map放出点経緯度 = get(atomMap設定_放出点経緯度)
  const input = get(deriv計算_入力)
  const 放出点セル0 = get(atomMap設定_放出点セル)
  if (!map放出点経緯度 || !input || !放出点セル0) return undefined
  const 放出点セル = input.lohdimLes?.放出点 ?? 放出点セル0
  return get計算領域({ ...map放出点経緯度, input, 放出点セル })
})

/**
 * 放出点と`Input`から計算領域の情報を返す
 */
function get計算領域({
  緯度,
  経度,
  input,
  放出点セル: { x, y }
}: {
  緯度: number
  経度: number
  input: Input
  放出点セル: Type放出点セル
}): Type計算領域 {
  const { lohdimLes, sibyl } = input
  const rectLohdimLes = lohdimLes
    ? getRectangle(
        緯度,
        経度,
        lohdimLes.cellSize * (x - 0.5),
        lohdimLes.cellSize * (lohdimLes.nx - x + 0.5),
        lohdimLes.cellSize * (lohdimLes.ny - y + 0.5),
        lohdimLes.cellSize * (y - 0.5)
      )
    : sibyl // SIBYLの入力ファイルしかない場合
      ? getRectangle(
          緯度,
          経度,
          sibyl.cellSize * (x - 0.5),
          sibyl.cellSize * (sibyl.sourceX.max - sibyl.sourceX.min - x + 1.5),
          sibyl.cellSize * (sibyl.sourceY.max - sibyl.sourceY.min - y + 1.5),
          sibyl.cellSize * (y - 0.5)
        )
      : undefined
  const rectSibyl = sibyl
    ? getRectangle(
        緯度,
        経度,
        sibyl.cellSize * (x - 0.5),
        sibyl.cellSize * (sibyl.targetX.max - sibyl.targetX.min - x + 1.5),
        sibyl.cellSize * (sibyl.targetY.max - sibyl.targetY.min - y + 1.5),
        sibyl.cellSize * (y - 0.5)
      )
    : undefined

  return {
    rectangleLohdimLes: rectLohdimLes
      ? Rectangle.fromDegrees(
          rectLohdimLes.経度.min,
          rectLohdimLes.緯度.min,
          rectLohdimLes.経度.max,
          rectLohdimLes.緯度.max
        )
      : undefined,
    rectangleSibyl: rectSibyl
      ? Rectangle.fromDegrees(
          rectSibyl.経度.min,
          rectSibyl.緯度.min,
          rectSibyl.経度.max,
          rectSibyl.緯度.max
        )
      : undefined,
    zGrid:
      lohdimLes || sibyl
        ? {
            z: lohdimLes?.zData ?? sibyl!.zData,
            緯度: rectLohdimLes?.緯度.max ?? rectSibyl!.緯度.max,
            min経度: rectLohdimLes?.経度.min ?? rectSibyl!.経度.min,
            max経度: rectLohdimLes?.経度.max ?? rectSibyl!.経度.max
          }
        : undefined,
    xyGrid: lohdimLes
      ? new Cartesian2(lohdimLes.nx, lohdimLes.ny)
      : sibyl
        ? getCartesian2(sibyl.sourceX, sibyl.sourceY)
        : undefined
  }
}

/**
 * `緯度, 経度`から`left, right, top, bottom [m]`方向へそれぞれ進んだ点が作る四角形領域を返す。
 */
function getRectangle(
  緯度: number,
  経度: number,
  left: number,
  right: number,
  top: number,
  bottom: number
) {
  const geoX = new EllipsoidGeodesic(
    Cartographic.fromDegrees(経度, 緯度),
    Cartographic.fromDegrees(経度 + 1e-5, 緯度)
  )
  const geoY = new EllipsoidGeodesic(
    Cartographic.fromDegrees(経度, 緯度),
    Cartographic.fromDegrees(経度, 緯度 + 1e-5)
  )
  const l = geoX.interpolateUsingSurfaceDistance(-left)
  const r = geoX.interpolateUsingSurfaceDistance(right)
  const t = geoY.interpolateUsingSurfaceDistance(top)
  const b = geoY.interpolateUsingSurfaceDistance(-bottom)

  return {
    緯度: { min: CesiumMath.toDegrees(b.latitude), max: CesiumMath.toDegrees(t.latitude) },
    経度: { min: CesiumMath.toDegrees(l.longitude), max: CesiumMath.toDegrees(r.longitude) }
  }
}

function getCartesian2(x: Range, y: Range) {
  return new Cartesian2(x.max - x.min + 1, y.max - y.min + 1)
}
