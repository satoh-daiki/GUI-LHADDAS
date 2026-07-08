import { Fragment } from 'react/jsx-runtime'
import { Colormap } from './colormaps'
import { clamp } from '@renderer/utils/clamp'
import { TypeScale } from '@renderer/hooks/atoms/atoms可視化タブ'
import { range } from '@renderer/utils/range'

/**
 * カラーバー（地図上に表示する凡例）
 */
export function Colorbar({
  label,
  min,
  middle,
  max,
  scale,
  colormap
}: {
  min: number
  middle?: number
  max: number
  scale: TypeScale
  label: string
  colormap: Colormap
}) {
  const fontColor = 'white'
  const [width, height] = [110, 180]
  const marginY = 10
  const barSize = {
    left: 30,
    right: 46,
    top: marginY,
    bottom: height - marginY
  }
  let ratio: number | undefined
  if (middle !== undefined) {
    ratio =
      scale === 'linear'
        ? (middle - min) / (max - min)
        : (Math.log(middle) - Math.log(min)) / (Math.log(max) - Math.log(min))
  }

  return (
    <svg width={width} height={height} {...{ inert: '' }}>
      {/* 半透明の背景 */}
      <rect x="0" y="0" rx="5" ry="5" width={width} height={height} fill="#0005" />
      {/* "線量率 [μSv/h]" など */}
      <text
        x={18}
        y={height / 2 - 7}
        fill={fontColor}
        fontSize={12}
        transform={`rotate(-90 ${18} ${height / 2 - 7})`}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
      {/* カラーバー */}
      <Bar barSize={barSize} colormap={colormap} ratio={ratio} />
      {/* ティック */}
      <Ticks min={min} max={max} scale={scale} color={fontColor} barSize={barSize} />
    </svg>
  )
}

type TypeBarSize = {
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * カラーバー部分
 */
function Bar({
  colormap,
  ratio,
  barSize: { bottom, left, right, top }
}: {
  barSize: TypeBarSize
  ratio?: number
  colormap: Colormap
}) {
  const division = 70
  return range(division).map((i) => {
    const dh = (bottom - top) / division
    const h = bottom - top - i * dh
    const v = 1 - (i + 0.5) / division
    let color =
      '#' +
      colormap(v)
        .map((v) =>
          Math.trunc(255 * v)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    if (ratio !== undefined && ratio * division > division - i) {
      color = '#000'
    }
    return (
      <rect
        key={`${i}${color}`}
        x={left}
        y={top + dh * i}
        width={right - left}
        height={h}
        fill={color}
      />
    )
  })
}

/**
 * ラベル部分
 */
function Ticks({
  min,
  max,
  scale,
  color,
  barSize: { bottom, right, top }
}: {
  min: number
  max: number
  scale: TypeScale
  color: string
  barSize: TypeBarSize
}) {
  let labels: TypeLabels
  if (toString(min) === toString(max)) {
    labels = [
      { y: 0, label: toString(min) },
      { y: 1, label: toString(max) }
    ]
  } else {
    labels = scale === 'linear' ? getValuesLinear(min, max) : getValuesLog(min, max)
  }
  return labels.map((l) => {
    const y = clamp(top + 1, bottom - l.y * (bottom - top), bottom - 1)
    return (
      <Fragment key={`${l.y} ${l.label}`}>
        <path d={`M${right} ${y} h 5`} stroke={color} />
        <text x={right + 8} y={y + 4} fill={color} fontSize={12}>
          {l.label}
        </text>
      </Fragment>
    )
  })

  /// ローカル関数
  // 線形表示の時のティック
  function getValuesLinear(min: number, max: number) {
    const base = Math.pow(10, Math.ceil(Math.log10(max)) - 1)
    let vals = getVals(base, 1)
    if (vals.length < 3) vals = getVals(base, 2)
    if (vals.length < 3) vals = getVals(base, 5)
    if (vals.length < 3) vals = getVals(base, 10)

    return [min, max, ...vals].map((v) => ({
      y: (v - min) / (max - min),
      label: toString(v)
    }))

    /// ローカル関数
    function getVals(base: number, devider: number) {
      const vals: number[] = []
      const step = base / devider
      for (let i = 0; ; i++) {
        const v = 10 * base - i * step
        if (v >= max) continue
        if (v <= min) break
        if (tooClose(v, min)) continue
        if (tooClose(v, max)) continue
        if (tooClose(v, vals.at(-1))) continue
        vals.push(v)
      }
      return vals
    }
    function tooClose(a: number, b?: number) {
      if (b === undefined) return false
      return Math.abs(a - b) / (max - min) < MIN_DISTANCE
    }
  }
  // 対数表示の時のティック
  function getValuesLog(min: number, max: number) {
    const degits: number[] = []
    const [logMin, logMax] = [Math.log10(min), Math.log10(max)]
    for (let i = Math.floor(logMax); i >= logMin; i--) {
      if (tooClose(i, logMin)) continue
      if (tooClose(i, logMax)) continue
      if (tooClose(i, degits.at(-1))) continue
      degits.push(i)
    }
    const vals = degits.map((v) => Math.pow(10, v))
    return [min, max, ...vals].map((v) => ({
      y: (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min)),
      label: toString(v)
    }))

    /// ローカル関数
    function tooClose(a: number, b?: number) {
      if (b === undefined) return false
      return Math.abs(a - b) / (logMax - logMin) < MIN_DISTANCE
    }
  }
}

type TypeLabels = {
  y: number
  label: string
}[]
const MIN_DISTANCE = 0.1
const toString = (v: number) => v.toExponential(2)
