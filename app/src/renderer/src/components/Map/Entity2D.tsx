import { Primitive, useCesium } from 'resium'
import {
  EllipsoidSurfaceAppearance,
  GeometryInstance,
  Material,
  Rectangle,
  RectangleGeometry,
  TextureMagnificationFilter,
  TextureMinificationFilter
} from 'cesium'
import { Output2D } from '@renderer/Output'
import { TypeScale } from '@renderer/hooks/atoms/atoms可視化タブ'
import { useEffect, useMemo, useRef } from 'react'
import { Colormap } from './colormaps'
import { DEFAULT_MINMAX } from '@renderer/hooks/atoms/deriv可視化_Reset'
import { clamp } from '@renderer/utils/clamp'

/**
 * 2次元画像を表示するコンポーネント
 */
export function Entity2D({
  id,
  min,
  max,
  scale,
  rectangle,
  output2D,
  colormap
}: {
  id?: string
  min: number
  max: number
  scale: TypeScale
  rectangle?: Rectangle
  output2D?: Output2D | null
  colormap: Colormap
}) {
  const { viewer } = useCesium()
  const refGeometry = useRef<GeometryInstance>()
  const refRectangle = useRef<Rectangle>()
  const appearance = useMemo(
    () =>
      new EllipsoidSurfaceAppearance({
        aboveGround: false
      }),
    []
  )
  useEffect(() => {
    viewer?.scene.requestRender()
    // setTimeoutがないと1コマ前の最大最小の設定で表示されていることがある。
    const id = setTimeout(() => {
      viewer?.scene.requestRender()
    }, 200)
    return () => clearTimeout(id)
  }, [min, max, scale, output2D])


  if (!rectangle) return null
  if (output2D === null) return null // 読込み中は`undefined`
  if (min === DEFAULT_MINMAX && max === DEFAULT_MINMAX) return null

  const rectKey = `${id ?? '2d'}:${rectangle.west},${rectangle.south},${rectangle.east},${rectangle.north}`

  // 形状更新
  if (output2D && refRectangle.current !== rectangle) {
    refGeometry.current = new GeometryInstance({
      id,
      geometry: new RectangleGeometry({
        rectangle,
        vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT
      })
    })
    refRectangle.current = rectangle
  }
  // 画像更新
  const image = getImage(min, max, scale, output2D, colormap)
  if (image) {
    if (!appearance.material.uniforms.image) {
      appearance.material = new Material({
        fabric: {
          type: 'Image',
          uniforms: { image }
        },
        minificationFilter: TextureMinificationFilter.NEAREST,
        magnificationFilter: TextureMagnificationFilter.NEAREST
      })
    } else {
      // materialを上書きすると一瞬真っ白になるので、imageを上書きする
      appearance.material.uniforms.image = image
    }
  }

    return (
    <Primitive
      key={rectKey}
      geometryInstances={refGeometry.current}
      appearance={appearance}
    />
  )
}

function getImage(
  min: number,
  max: number,
  scale: TypeScale,
  output2D: Output2D | undefined,
  /** 0-1の値をRBGAに変換する関数 */
  colormap: Colormap
): string | undefined {
  if (!output2D) return undefined
  const { data, nx, ny } = output2D
  const canvas = document.createElement('canvas')
  canvas.width = nx
  canvas.height = ny
  const context = canvas.getContext('2d')
  if (!context) return undefined
  const isLog = scale === 'log'

  // キャンバス全体のピクセル情報を取得
  if (isLog) {
    min = Math.log(min)
    max = Math.log(max)
  }
  const imageData = context.getImageData(0, 0, nx, ny)
  const pixels = imageData.data
  const getRGBA = (v: number) => {
    const alpha = 0.8 * 255
    if (v < 0) return [100, 100, 100, alpha]
    if (isLog) {
      v = Math.log(v)
    }
    let r = (v - min) / (max - min)
    r = clamp(0, r, 1)
    const rgb = colormap(r)
    return [255 * rgb[0], 255 * rgb[1], 255 * rgb[2], alpha]
  }

  // ピクセル操作
  for (let y = 0; y < ny; ++y) {
    for (let x = 0; x < nx; ++x) {
      const iDat = y * nx + x
      const iImg = (ny - y - 1) * nx + x
      const base = iImg * 4
      const val = data[iDat]
      const rgba = isNaN(val) ? [0, 0, 0, 0] : getRGBA(val)
      pixels[base + 0] = rgba[0]
      pixels[base + 1] = rgba[1]
      pixels[base + 2] = rgba[2]
      pixels[base + 3] = rgba[3]
    }
  }
  context.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}
