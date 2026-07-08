import { atomGlobal_is読込み中 } from '@renderer/hooks/atoms/atomsGlobal'
import { Type放出点セル, Type放出点経緯度 } from '@renderer/hooks/atoms/atomsMap設定'
import { TypeScale } from '@renderer/hooks/atoms/atoms可視化タブ'
import { minValue, Output3D } from '@renderer/Output'
import {
  Cartesian3,
  ClippingPlane,
  ClippingPlaneCollection,
  CustomShader,
  Matrix3,
  Matrix4,
  MetadataComponentType,
  MetadataType,
  Transforms,
  UniformType,
  VoxelPrimitive,
  VoxelProvider,
  VoxelShapeType
} from 'cesium'
import { useSetAtom } from 'jotai'
import { memo, useEffect } from 'react'
import { createCesiumComponent, useCesium } from 'resium'
import { useAtomValue } from 'jotai'
import { atom建物オフセット} from '@renderer/hooks/atoms/atomsMap設定'

type TypeXYZ = { x: number; y: number; z: number }

export const Entity3D = memo(Entity3D_)

export function Entity3D_({
  放出点,
  output3D,
  sizeXY,
  zData,
  clip,
  放出点セル,
  min,
  middle,
  max,
  scale,
  is建物,
  offsetX,
  offsetY
}: {
  放出点: Type放出点経緯度
  output3D: Output3D
  sizeXY: number
  zData: number[]
  放出点セル: Type放出点セル
  clip?: ClippingPlane
  min: number
  middle: number
  max: number
  scale: TypeScale
  is建物?: boolean
  offsetX: number
  offsetY: number
}) {
  const { viewer } = useCesium()
  const setWaiting = useSetAtom(atomGlobal_is読込み中)
  // const {x: offsetX, y: offsetY} = useAtomValue(atom建物オフセット)

  useEffect(() => {
    if (min < 0 || (scale === 'log' && min === 0)) return
    if (0 < min && min < minValue) return
    if (!(min <= middle && middle <= max)) return
    customShader.setUniform('u_log', scale === 'log')
    customShader.setUniform('u_min', min)
    customShader.setUniform('u_middle', middle)
    customShader.setUniform('u_max', max)
  }, [min, middle, max, scale])
  // 表示中に放出点を変更したときに、それを反映させるために再描画する
  useEffect(() => {
    // 時間がかかるのでプログレスインジケータを表示する
    setWaiting(true)
    // setTimeoutを使わないと、なぜかプログレスインジケータが消えなくなることがある
    setTimeout(() => {
      viewer?.scene.requestRender()
    }, 10)
  }, [放出点, 放出点セル, offsetX, offsetY])
  // 通常の再描画処理
  useEffect(() => {
    customShader.setUniform('u_lighting', is建物 ? 0.5 : 0.8)
    viewer?.scene.requestRender()
  }, [min, max, middle, scale, clip, output3D, offsetX, offsetY])

  const voxelZ = toVoxelZ(zData)
  if (!voxelZ) return null

  // 400x400x100のような大きなデータを1つのVoxelPrimitiveに入れるとエラーになるので、複数に分割する。
  // 分割しすぎてもエラーになる。
  // 分割数が多くなるほど初期化が遅くなる。
  const maxNumXY = 100 // xy方向の一片のセル数 100あたりが上限ぽい。ハードウェアに依存しそう
  const maxNumZ = 100
  const entities: JSX.Element[] = []


  for (let ix = 0; ix < output3D.nx; ix += maxNumXY) {
    for (let iy = 0; iy < output3D.ny; iy += maxNumXY) {
      for (let iz = 0; iz < voxelZ.cells; iz += maxNumZ) {
        const maxX = Math.min(output3D.nx, ix + maxNumXY)
        const maxY = Math.min(output3D.ny, iy + maxNumXY)
        const maxZ = Math.min(voxelZ.cells, iz + maxNumZ)
        entities.push(
          <Entity3DPartial
            key={`${ix},${iy},${iz},${放出点.経度},${放出点.緯度},${放出点セル.x},${放出点セル.y},${放出点セル.z},${offsetX},${offsetY}`} // 放出点などを含めているのは、表示中に放出点を変更したときに、それを反映させるため
            放出点={放出点}
            放出点セル={放出点セル}
            clip={clip}
            sizeXY={sizeXY}
            voxelZ={voxelZ}
            z={zData}
            output3D={output3D}
            min={{ x: ix, y: iy, z: iz }}
            max={{ x: maxX, y: maxY, z: maxZ }}
            offsetX={offsetX}
            offsetY={offsetY}
          />
        )
      }
    }
  }

  return entities
}

// `createCesiumComponent` を使うとResiumで用意されていないコンポーネントも使える。
// ただしドキュメントがないので、`LabelCollection.ts`等を参考にした。
// ref) https://resium.reearth.io/advanced#define-a-new-cesium-component

interface Props {
  放出点: Type放出点経緯度
  output3D: Output3D
  放出点セル: Type放出点セル
  clip?: ClippingPlane
  sizeXY: number
  voxelZ: VoxelZType
  z: number[]
  min: TypeXYZ
  max: TypeXYZ
  offsetX: number
  offsetY: number
}

/**
 * 1つのVoxelPrimitive
 */
export const Entity3DPartial = createCesiumComponent<VoxelPrimitive, Props>({
  name: 'Entity3DPartial',
  create(context, props) {
    if (!context.scene || !context.primitiveCollection) return
    const { output3D, voxelZ, min, max } = props

    const provider = ProceduralMultiTileVoxelProvider(output3D, min, max, voxelZ.coeffs)
    const { modelMatrix, clippingPlanes } = getGeometry(props)
    const voxelPrimitive = new VoxelPrimitive({ provider, customShader, modelMatrix })
    
    voxelPrimitive.nearestSampling = true
    voxelPrimitive.clippingPlanes = clippingPlanes
    context.primitiveCollection.add(voxelPrimitive)
    return voxelPrimitive
  },
  update(element, props, prevProps, _context) {
    // 追加: オフセットや放出点が変更された場合に modelMatrix を更新する
    if (
      props.offsetX !== prevProps.offsetX ||
      props.offsetY !== prevProps.offsetY ||
      props.放出点.経度 !== prevProps.放出点.経度 ||
      props.放出点.緯度 !== prevProps.放出点.緯度 ||
      props.放出点セル.z !== prevProps.放出点セル.z
    ) {
      const { modelMatrix } = getGeometry(props)
      element.modelMatrix = modelMatrix
    }

    if (props.clip !== prevProps.clip) {
      const clippingPlanes = element.clippingPlanes
      if (prevProps.clip) {
        clippingPlanes.remove(prevProps.clip)
      }
      if (props.clip) {
        clippingPlanes.add(props.clip)
      }
    }
  },
  destroy(element, context) {
    if (context.primitiveCollection && !context.primitiveCollection.isDestroyed()) {
      context.primitiveCollection.remove(element)
    }
    if (!element.isDestroyed()) {
      element.destroy()
    }
  }
})

/**
 * output3D.dataはz方向に等間隔ではないので等間隔グリッドに変換する必要がある。
 * そのためのパラメータを持つ。
 */
interface VoxelZType {
  /** セル当たりの高さ */
  cellHeight: number
  /** 全体の高さ */
  height: number
  /** グリッド数 */
  cells: number
  /** [iz][iz0, iz1, r0, r1]; dataを等間隔グリッドに変換するための係数 */
  coeffs: number[][]
}

/**
 *  出力データのz方向は等間隔ではないので、等間隔にするための係数を取得する
 */
function toVoxelZ(z: number[]): VoxelZType | undefined {
  if (z.length < 2) return undefined
  let cellHeight = Number.POSITIVE_INFINITY
  for (let i = 1; i < z.length; i++) {
    cellHeight = Math.min(cellHeight, z[i] - z[i - 1])
    if (cellHeight <= 1) return undefined
  }
  const height = z[z.length - 1] ?? 0
  //const height = z.at(-1) ?? 0
  const cells = Math.trunc(height / cellHeight)
  const coeffs: number[][] = []

  let i = 0
  for (let j = 0; j < cells; j++) {
    for (; i < z.length; i++) {
      const zj0 = j * cellHeight
      const zj1 = (j + 1) * cellHeight
      const zi1 = z[i + 1]
      if (zi1 <= zj0) continue
      const contains = zj1 <= zi1
      const i0 = i
      const i1 = contains ? i : i + 1
      const r0 = contains ? 1 : (zi1 - zj0) / cellHeight
      const r1 = 1 - r0
      coeffs.push([i0, i1, r0, r1])
      break
    }
    if (i === z.length) break
  }
  if (coeffs.length !== cells) return undefined
  return { cellHeight, height, cells, coeffs }
}

/**
 * 位置計算
 */
function getGeometry({ 放出点, 放出点セル, clip, sizeXY, voxelZ, z, min, max, offsetX, offsetY }: Props) {
  const 高度 = (z[放出点セル.z - 1] + z[放出点セル.z]) / 2
  const 放出点3D = Cartesian3.fromDegrees(放出点.経度, 放出点.緯度, 高度)
  const offset = new Cartesian3(
    ((min.x + max.x) / 2 - (放出点セル.x - 0.5)) * sizeXY,
    ((min.y + max.y) / 2 - (放出点セル.y - 0.5)) * sizeXY,
    ((min.z + max.z) / 2) * voxelZ.cellHeight - 高度
  )
  const size = new Cartesian3(
    sizeXY * (max.x - min.x),
    sizeXY * (max.y - min.y),
    voxelZ.cellHeight * (max.z - min.z)
  )

  const scale = Cartesian3.multiplyByScalar(size, 0.5, new Cartesian3())
  const transform = Transforms.eastNorthUpToFixedFrame(放出点3D)
  const rotation = Matrix4.getRotation(transform, new Matrix3())
  const center = Matrix4.getTranslation(transform, new Cartesian3())

  let modelMatrix = Matrix4.IDENTITY
  modelMatrix = Matrix4.multiplyByTranslation(modelMatrix, center, new Matrix4())
  modelMatrix = Matrix4.multiplyByMatrix3(modelMatrix, rotation, new Matrix4())

  const offsetFromBuilding = new Cartesian3(offsetX, offsetY, 0)
  modelMatrix = Matrix4.multiplyByTranslation(modelMatrix, offsetFromBuilding, new Matrix4());

  const clippingPlanes = new ClippingPlaneCollection({
    planes: clip ? [clip] : [],
    edgeWidth: 0.0,
    modelMatrix
  })

  modelMatrix = Matrix4.multiplyByTranslation(modelMatrix, offset, new Matrix4())
  modelMatrix = Matrix4.multiplyByScale(modelMatrix, scale, new Matrix4())
  return { modelMatrix, clippingPlanes }
}

/**
 * ボクセルデータ
 */
function ProceduralMultiTileVoxelProvider(
  output3D: Output3D,
  min: TypeXYZ,
  max: TypeXYZ,
  meshZ: number[][] // [iz][iz0, iz1, r0, r1] // dataを等間隔グリッドに変換するための係数
) {
  const dimensions = new Cartesian3(max.x - min.x, max.y - min.y, max.z - min.z)
  const data = output3D.data
  const { nx, ny } = { nx: output3D.nx, ny: output3D.ny }
  return {
    shape: VoxelShapeType.BOX,
    dimensions,
    names: ['value'],
    types: [MetadataType.SCALAR],
    componentTypes: [MetadataComponentType.FLOAT32],
    requestData: ({ tileLevel }: { tileLevel: number }) => {
      if (tileLevel !== 0) return undefined // 細かくしない
      const dataTile = constructRandomTileData()
      return Promise.resolve([dataTile])
    }
  } as VoxelProvider

  // ローカル関数
  function constructRandomTileData() {
    const { x, y, z } = dimensions
    const voxelCount = x * y * z
    const channelCount = 1
    const values = new Float32Array(voxelCount * channelCount)

    let i = 0
    for (let iz = 0; iz < z; iz++) {
      const [iz0, iz1, r0, r1] = meshZ[min.z + iz]
      const indexZ0 = iz0 * ny * nx
      const indexZ1 = iz1 * ny * nx
      for (let iy = 0; iy < y; iy++) {
        const indexZY0 = indexZ0 + (min.y + iy) * nx
        const indexZY1 = indexZ1 + (min.y + iy) * nx
        for (let ix = 0; ix < x; ix++) {
          const v0 = data[indexZY0 + min.x + ix]
          const v1 = data[indexZY1 + min.x + ix]
          const v = indexZY0 === indexZY1 ? v0 : v0 * r0 + v1 * r1
          values[i] = v
          i += channelCount
        }
      }
    }

    return values
  }
}

/**
 * フラグメントシェーダー
 */
export const customShader = new CustomShader({
  fragmentShaderText: `void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
    {
      vec3 voxelNormal = normalize(czm_normal * fsInput.voxel.surfaceNormal);
      float diffuse = max(0.0, dot(voxelNormal, czm_lightDirectionEC));
      diffuse = max(0.0, dot(voxelNormal, vec3(0.0, 0.0, 1.0)));
      float lighting = u_lighting + (1.0 - u_lighting) * diffuse;
      float v = fsInput.metadata.value;
      if(v < 0.0) {
        material.diffuse = vec3(0.5, 0.5, 0.5) * lighting;
        material.alpha = 1.0;
        return;
      }
      if (v < u_middle) return;
      float r;
      if(u_log) {
        r = (log(v) - log(u_min)) / (log(u_max) - log(u_min));
      } else {
        r = (v - u_min) / (u_max - u_min);
      }
      vec3 rgbs[7] = vec3[](
        vec3(0.0, 0.0, 0.6420454545454546),
        vec3(0.0, 0.25, 1.0),
        vec3(0.0, 0.875, 0.9879032258064517),
        vec3(0.4838709677419355, 1.0, 0.4838709677419356),
        vec3(0.9879032258064515, 0.9398148148148149, 0.0),
        vec3(1.0, 0.36111111111111116, 0.0),
        vec3(0.6420454545454546, 0.0, 0.0)
      );
      int i = int(trunc(r * float(7)));
      material.diffuse = rgbs[i] * lighting;
      material.alpha = 1.0;

      int tileIndex = fsInput.voxel.tileIndex;
      int sampleIndex = fsInput.voxel.sampleIndex;      
      if (tileIndex == u_selectedTile && sampleIndex == u_selectedSample) {
        material.diffuse = mix(material.diffuse, vec3(1.0), 0.5);
      }
    }`,
  uniforms: {
    u_min: {
      type: UniformType.FLOAT,
      value: 1.0e-30
    },
    u_middle: {
      type: UniformType.FLOAT,
      value: 1.0e-30
    },
    u_max: {
      type: UniformType.FLOAT,
      value: 1.0e30
    },
    u_log: {
      type: UniformType.BOOL,
      value: false
    },
    u_lighting: {
      type: UniformType.FLOAT,
      value: 0.8
    },
    u_selectedTile: {
      type: UniformType.INT,
      value: -1.0
    },
    u_selectedSample: {
      type: UniformType.INT,
      value: -1.0
    }
  }
})
