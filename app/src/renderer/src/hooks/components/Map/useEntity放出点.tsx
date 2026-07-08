import { atomGlobal_tabName } from '@renderer/hooks/atoms/atomsGlobal'
import {
  atom可視化_地表沈着濃度Checked,
  atom可視化_大気中濃度Checked,
  atom可視化_線量率Checked
} from '@renderer/hooks/atoms/atoms可視化タブ'
import { deriv放出点3D } from '@renderer/hooks/atoms/deriv放出点3D'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useCesium } from 'resium'

export function useEntity放出点() {
  const tabName = useAtomValue(atomGlobal_tabName)
  const 放出点 = useAtomValue(deriv放出点3D)
  const 線量率Checked = useAtomValue(atom可視化_線量率Checked)
  const 地表沈着濃度Checked = useAtomValue(atom可視化_地表沈着濃度Checked)
  const 大気中濃度Checked = useAtomValue(atom可視化_大気中濃度Checked)

  const hidden =
    tabName === '可視化タブ' && (線量率Checked || 大気中濃度Checked || 地表沈着濃度Checked)

  // Cesiumの再描画
  const { viewer } = useCesium()
  useEffect(() => {
    viewer?.scene.requestRender()
  }, [viewer, hidden, 放出点])

  return {
    hidden,
    放出点
  }
}
