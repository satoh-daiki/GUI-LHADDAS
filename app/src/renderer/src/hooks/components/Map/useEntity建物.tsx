import { atomMap設定_放出点経緯度, Type放出点セル } from '../../atoms/atomsMap設定'
import { atomGlobal_tabName } from '../../atoms/atomsGlobal'
import { useMemo, useRef } from 'react'
import { deriv計算_入力 } from '@renderer/hooks/atoms/deriv計算_入力'
import { useAtomValue } from 'jotai'
import { Output3D } from '@renderer/Output'
import { atom計算_LohdimLes入力フォルダ } from '@renderer/hooks/atoms/atoms計算タブ'

export function useEntity建物() {
  const 放出点 = useAtomValue(atomMap設定_放出点経緯度)
  const pathLlohdimLes = useAtomValue(atom計算_LohdimLes入力フォルダ)
  const input = useAtomValue(deriv計算_入力)
  const tabName = useAtomValue(atomGlobal_tabName)
  const refLohdimLes = useRef('')
  const refOutput3D = useRef<Output3D | undefined>()
  const refZData = useRef<number[] | undefined>()
  const ref放出点セル = useRef<Type放出点セル | undefined>()
  const refSizeXY = useRef<number | undefined>()

  const output3D = useMemo<Output3D | undefined>(() => {
    if (refLohdimLes.current === pathLlohdimLes) return refOutput3D.current
    if (!input?.lohdimLes) return refOutput3D.current
    const { nx, ny, nz, buildingData, zData } = input.lohdimLes
    const data = new Float32Array(nx * ny * nz)
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        const ixy = iy * nx + ix
        const height = buildingData[ixy]
        for (let iz = 0; iz < nz; iz++) {
          const ixyz = iz * ny * nx + ixy
          const is建物 = (zData[iz] + zData[iz + 1]) / 2 <= height
          data[ixyz] = is建物 ? -1 : 0
        }
      }
    }
    refLohdimLes.current = pathLlohdimLes
    refZData.current = input.lohdimLes.zData
    ref放出点セル.current = input.lohdimLes.放出点
    refSizeXY.current = input.lohdimLes.cellSize
    refOutput3D.current = {
      data,
      nx,
      ny,
      nz,
      minNonZero: 1,
      maxNonZero: 1
    }
    return refOutput3D.current
  }, [pathLlohdimLes, input?.lohdimLes])

  //const show = (tabName === '計算タブ' || tabName == '設定タブ') && (!input || input?.lohdimLes)
  const show = (
    tabName === '設定タブ' ||
    tabName === 'LOHDIM入力タブ' ||
    tabName === 'SIBYL入力タブ' ||
    tabName === '計算タブ' ||
    tabName === '可視化タブ'
  ) && !!input?.lohdimLes;
  // 読込み中は input === undefined になる。
  // その際に表示が切り替わらないようにしている。
  // そうしないと、LOHDIM-LES入力フォルダを指定した状態で、SIBYL入力フォルダを変更すると、そのたびに建物データが再描画される。

  return {
    放出点,
    output3D,
    sizeXY: input?.lohdimLes?.cellSize,
    show,
    zData: input?.lohdimLes?.zData,
    放出点セル: input?.lohdimLes?.放出点
  }
}
