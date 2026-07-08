import { atom } from 'jotai'
import { atomMap設定_放出点セル, atomMap設定_放出点経緯度 } from '../atoms/atomsMap設定'
import { deriv計算_入力 } from './deriv計算_入力'
import { Cartesian3, Cartographic, Math as CesiumMath } from 'cesium'

/**
 * 放出点の3次元位置を持つ derived atom
 */
export const deriv放出点3D = atom((get) => {
    const map放出点経緯度 = get(atomMap設定_放出点経緯度);
    const 放出点セル = get(atomMap設定_放出点セル);
    const input = get(deriv計算_入力);

    if (!map放出点経緯度) return undefined;
    if (!input) return { ...map放出点経緯度, 高度: 0 };

    // デフォルト値（補正なし）を準備しておく
    let 緯度 = map放出点経緯度.緯度;
    let 経度 = map放出点経緯度.経度;
    let 高度 = 0;

    if (input && 放出点セル) {
        const sizeXY = input.lohdimLes?.sizeXY ?? input.sibyl?.cellSize;
        const zData = input.lohdimLes?.zData ?? input.sibyl?.zData;

        if (zData && 放出点セル.z >= 1 && 放出点セル.z < zData.length) {
            高度 = (zData[放出点セル.z - 1] + zData[放出点セル.z]) / 2;
        }
    }

    return { 緯度, 経度, 高度 }; // inputが無くても緯度経度を返すので、点が消えなくなる
});
// export const deriv放出点3D = atom((get) => {
//   const map放出点経緯度 = get(atomMap設定_放出点経緯度)
//   const 放出点セル = get(atomMap設定_放出点セル)
//   const input = get(deriv計算_入力)
// 
//   if (!map放出点経緯度) return undefined
//   if (!input) return { ...map放出点経緯度, 高度: 0 };
// 
//   let 高度: number | undefined
//   if ((input?.lohdimLes || input?.sibyl) && 放出点セル) {
//     const z = input?.lohdimLes?.zData ?? input?.sibyl?.zData
//     const nz = 放出点セル?.z
//     const isOk = z !== undefined && nz !== undefined && 1 <= nz && nz <= z.length - 1
//     if (!isOk) return undefined
//     高度 = (z[nz - 1] + z[nz]) / 2
//   }
// 
// 
//   let { 緯度, 経度 } = map放出点経緯度
//   const sizeXY = input?.lohdimLes?.cellSize ?? input?.sibyl?.cellSize 
// 
//   if (sizeXY && 放出点セル) {
//     // セル(1,1)を基準とした位置のずれ(メートル)
//     // セル中心に合わせるため-0.5を考慮
//     const offsetX = (放出点セル.x - 0.5) * sizeXY
//     const offsetY = (放出点セル.y - 0.5) * sizeXY
// 
//     // メートル単位のオフセットを経緯度に変換
//     const center = Cartesian3.fromDegrees(map放出点経緯度.経度, map放出点経緯度.緯度)
//     // 東方向(X)と北方向(Y)への移動を計算
//     const offsetCartesian = new Cartesian3(offsetX, offsetY, 0) 
//     
//     // 簡易的な補正
//     const R = 6378137 // 地球半径(m)
//     経度 -= (offsetX / (R * Math.cos(CesiumMath.toRadians(緯度)))) * (180 / Math.PI)
//     緯度 -= (offsetY / R) * (180 / Math.PI)
//   }
// 
//   return { 緯度, 経度, 高度 }
// })
