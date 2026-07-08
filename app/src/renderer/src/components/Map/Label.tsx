import { toString } from '@renderer/utils/stringUtil'
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  defined,
  HorizontalOrigin,
  Rectangle,
  ScreenSpaceEventType,
  VerticalOrigin
} from 'cesium'
import { useEffect, useState } from 'react'
import { Entity, LabelGraphics, ScreenSpaceEvent, ScreenSpaceEventHandler, useCesium } from 'resium'
import { customShader } from './Entity3D'

/**
 *  マウス位置の線量率などを表示するラベル
 */
export function Label2D({
  targetId,
  rectangle,
  cellSize,
  getValue
}: {
  targetId: '地表沈着濃度' | '線量率'
  rectangle?: Rectangle
  cellSize?: number
  getValue: (ix: number, iy: number) => string | undefined
}) {
  const [position, setPosition] = useState<Cartesian3>()
  const [show, setShow] = useState(false)
  const [text, setText] = useState('')
  const { viewer } = useCesium()
  useEffect(() => {
    viewer?.scene.requestRender()
  }, [show, text, position])

  if (!rectangle || cellSize === undefined || !viewer) return null
  return (
    <>
      <LabelEntity position={position} text={text} show={show} />
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          action={(e) => {
            setShow(false)
            const pos = (e as { endPosition: Cartesian2 }).endPosition
            const edgeDistance = Math.min(
              pos.x,
              pos.y,
              viewer.canvas.width - pos.x,
              viewer.canvas.height - pos.y
            )
            if (edgeDistance < 15) return
            const id = viewer.scene.pick(pos)?.id
            if (id !== targetId) return
            const cartesian = viewer.camera.pickEllipsoid(pos, viewer.scene.globe.ellipsoid)
            if (!cartesian) return
            const cart = Cartographic.fromCartesian(cartesian)
            const x = Cartographic.toCartesian(new Cartographic(cart.longitude, rectangle.south))
            const y = Cartographic.toCartesian(new Cartographic(rectangle.west, cart.latitude))
            const O = Cartographic.toCartesian(Rectangle.southwest(rectangle))
            const dx = Cartesian3.distance(O, x)
            const dy = Cartesian3.distance(O, y)
            const ix = Math.trunc(dx / cellSize)
            const iy = Math.trunc(dy / cellSize)
            const value = getValue(ix, iy)
            if (value === undefined) return
            setPosition(cartesian)
            setShow(true)
            setText(value)
          }}
          type={ScreenSpaceEventType.MOUSE_MOVE}
        />
      </ScreenSpaceEventHandler>
    </>
  )
}

/**
 *  マウス位置の線量率などを表示するラベル
 */
export function Label3D({ min }: { min: number }) {
  const [position, setPosition] = useState<Cartesian3>()
  const [show, setShow] = useState(false)
  const [text, setText] = useState('')
  const { viewer } = useCesium()

  if (!viewer) return null
  return (
    <>
      <LabelEntity position={position} text={text} show={show} />
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          action={(e) => {
            setShow(false)
            const pos = (e as { endPosition: Cartesian2 }).endPosition
            const cartesian = viewer.camera.pickEllipsoid(pos, viewer.scene.globe.ellipsoid)
            if (!cartesian) return
            const edgeDistance = Math.min(
              pos.x,
              pos.y,
              viewer.canvas.width - pos.x,
              viewer.canvas.height - pos.y
            )
            if (edgeDistance < 15) return
            const voxelCell = viewer.scene.pickVoxel(pos)
            if (!defined(voxelCell)) return
            if (true as boolean) return 
            // カーソル位置のボクセルを白くする
            const { tileIndex, sampleIndex } = voxelCell
            customShader.setUniform('u_selectedTile', tileIndex)
            customShader.setUniform('u_selectedSample', sampleIndex)
            // ボクセルの値を表示する
            const value = voxelCell.getProperty('value')[0]
            if (value === undefined || value < min) return
            setPosition(cartesian)
            setShow(true)
            setText(`${toString(value)} Bq/m³`)
          }}
          type={ScreenSpaceEventType.MOUSE_MOVE}
        />
      </ScreenSpaceEventHandler>
    </>
  )
}

function LabelEntity({
  show,
  text,
  position
}: {
  position?: Cartesian3
  text: string
  show: boolean
}) {
  return (
    <Entity position={position}>
      <LabelGraphics
        text={text}
        show={show}
        showBackground={true}
        font="14px monospace"
        horizontalOrigin={HorizontalOrigin.LEFT}
        verticalOrigin={VerticalOrigin.TOP}
        pixelOffset={new Cartesian2(15, 0)}
        disableDepthTestDistance={
          Number.POSITIVE_INFINITY
          // https://community.cesium.com/t/creating-plane-rectangle/16911/16
        }
      />
    </Entity>
  )
}
