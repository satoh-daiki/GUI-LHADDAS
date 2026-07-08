import { memo } from 'react'
import { Entity3D } from './Entity3D'
import { useEntity建物 } from '@renderer/hooks/components/Map/useEntity建物'
import { atom建物オフセット} from '@renderer/hooks/atoms/atomsMap設定'
import { useAtomValue } from 'jotai'

export const Entity建物 = memo(Entity建物_)

function Entity建物_() {
  const { 放出点, output3D, sizeXY, show, zData, 放出点セル } = useEntity建物()
  const {x, y} = useAtomValue(atom建物オフセット);
  if (!放出点 || !output3D || !sizeXY || !zData || !放出点セル || !show) return null
  return (
    <Entity3D
      放出点={放出点}
      output3D={output3D}
      sizeXY={sizeXY}
      zData={zData}
      放出点セル={放出点セル}
      min={1} // 0を透明にする
      middle={1}
      max={2}
      scale="linear"
      is建物={true}
      offsetX={x}
      offsetY={y}
    />
  )
}
