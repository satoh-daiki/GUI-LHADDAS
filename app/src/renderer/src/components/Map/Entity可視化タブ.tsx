import { Entity } from 'resium'
import { Color } from 'cesium'
import {
  useEntity可視化タブ,
  useEntity可視化タブ_地表沈着濃度,
  useEntity可視化タブ_大気中濃度,
  useEntity可視化タブ_線量率,
  useEntity可視化タブ_計算領域
} from '@renderer/hooks/components/Map/useEntity可視化タブ'
import { colormaps } from './colormaps'
import { Entity2D } from './Entity2D'
import { memo } from 'react'
import { Box } from '@mui/material'
import { Colorbar } from './Colorbar'
import { Label2D, Label3D } from './Label'
import { Entity3D } from './Entity3D'
import { useTranslation } from 'react-i18next'

/**
 * 可視化タブ選択時の可視化を行うコンポーネント（メモ化）
 */
export const Entity可視化タブ = memo(Entity可視化タブ_)

/**
 * 可視化タブ選択時の可視化を行うコンポーネント
 */
function Entity可視化タブ_() {
  const { t } = useTranslation();
  const { show地表沈着濃度, show大気中濃度, show線量率, show計算領域 } = useEntity可視化タブ()

  if (!show計算領域 && !show大気中濃度 && !show地表沈着濃度 && !show線量率) {
    return null;
  }

  return (
    // <Box>はカラーバー凡例用
    <Box
      sx={{
        position: 'absolute',
        bottom: 4,
        right: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}
      {...{ inert: '' /* マウスホバー時のラベル表示を阻害しないようにする */ }}
    >
      {show計算領域 && <Entity計算領域 />}
      {show大気中濃度 && <Entity大気中濃度 />}
      {show地表沈着濃度 && <Entity地表沈着濃度 />}
      {show線量率 && <Entity線量率 />}
    </Box>
  )
}

/**
 * 計算領域
 */
function Entity計算領域() {
  const { t } = useTranslation();
  const { is地理院地図, 計算領域 } = useEntity可視化タブ_計算領域()
  if (!計算領域 || !計算領域.rectangleLohdimLes) return null
  const { rectangleLohdimLes, zGrid } = 計算領域
  return (
    <Entity
      name="LOHDIM-LES 計算領域"
      rectangle={{
        coordinates: rectangleLohdimLes,
        extrudedHeight: zGrid ? zGrid.z.at(-1) : 0,
        outline: true,
        outlineColor: is地理院地図
          ? Color.MIDNIGHTBLUE.withAlpha(0.4)
          : Color.MIDNIGHTBLUE.withAlpha(0.4),
        material: Color.TRANSPARENT
      }}
    />
  )
}

/**
 * 大気中濃度
 */
function Entity大気中濃度() {
  const {t} = useTranslation()
  const {i18n} = useTranslation();

  const { 放出点, output3D, sizeXY, zData, clip, 放出点セル, min, middle, max, scale, offsetX, offsetY} =
    useEntity可視化タブ_大気中濃度()
  if (!放出点 || !output3D || !sizeXY || !zData || !放出点セル) return null
  const currentLang = i18n.resolvedLanguage;
  const colorbarLabel = t("atmospheric_concentration_legend_label")

  return (
    <>
      <Entity3D
        放出点={放出点}
        output3D={output3D}
        sizeXY={sizeXY}
        zData={zData}
        clip={clip}
        放出点セル={放出点セル}
        min={min}
        middle={middle}
        max={max}
        scale={scale}
	offsetX={offsetX}
	offsetY={offsetY}
      />
      <Colorbar
        min={min}
        max={max}
        middle={middle}
        label={colorbarLabel}
        scale={scale}
        colormap={colormap大気中濃度}
      />
      <Label3D min={min} />
    </>
  )
}
const colormap大気中濃度 = colormaps.jetDiscrete

/**
 * 地表沈着濃度
 */
function Entity地表沈着濃度() {
  const { t } = useTranslation();
  const { min, max, scale, output2D, rectangle, cellSize, getValue } =
    useEntity可視化タブ_地表沈着濃度()
  const colorbarLabel = t("surface_deposition_concentration_label") + "[Bq/m²]"

  return (
    <>
      <Entity2D
        id="地表沈着濃度"
        min={min}
        max={max}
        scale={scale}
        output2D={output2D}
        rectangle={rectangle}
        colormap={colormap地表沈着濃度}
      />
      <Colorbar
        min={min}
        max={max}
        label={colorbarLabel}
        scale={scale}
        colormap={colormap地表沈着濃度}
      />
      <Label2D
        targetId="地表沈着濃度"
        rectangle={rectangle}
        cellSize={cellSize}
        getValue={getValue}
      />
    </>
  )
}
const colormap地表沈着濃度 = colormaps.jet

/**
 * 線量率
 */
function Entity線量率() {
  const { label, min, max, scale, output2D, rectangle, cellSize, getValue } =
    useEntity可視化タブ_線量率()

  return (
    <>
      <Entity2D
        id="線量率"
        min={min}
        max={max}
        scale={scale}
        output2D={output2D}
        rectangle={rectangle}
        colormap={colormap線量率}
      />
      <Colorbar min={min} max={max} label={label} scale={scale} colormap={colormap線量率} />
      <Label2D targetId="線量率" rectangle={rectangle} cellSize={cellSize} getValue={getValue} />
    </>
  )
}
const colormap線量率 = colormaps.jet
