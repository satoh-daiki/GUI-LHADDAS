import { Map } from './components/Map/Map'
import { TabPanel } from './components/TabPanel'
import { Tab計算 } from './components/Tab計算/Tab計算'
import { Tab入力_lohdim } from './components/Tab入力_lohdim/Tab入力_lohdim'
import { Tab入力_sibyl } from './components/Tab入力_sibyl/Tab入力_sibyl'
import { Tab設定 } from './components/Tab設定/Tab設定'
import { Box, Stack, Tab, Tabs } from '@mui/material'
import { Map設定 } from './components/Map設定/Map設定'
import { Tab可視化 } from './components/Tab可視化/Tab可視化'
import { Theme } from './components/Theme'
import { useApp } from './hooks/useApp'
import { I18nextProvider } from 'react-i18next'
import { useTranslation } from 'react-i18next'
import {
  HelpOutline,
  Home,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight
} from '@mui/icons-material'
import { useMap } from '@renderer/hooks/components/Map/useMap'
import { useAtomValue, useSetAtom } from 'jotai'
import { deriv放出点3D } from '@renderer/hooks/atoms/deriv放出点3D'
import { atomMap設定_視点リセット } from '@renderer/hooks/atoms/atomsMap設定'
import { Tooltip, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { HomeIcon, CollapseIcon, HelpIcon } from './components/Map/Map'
//add 1209
import React, { useState, useEffect } from 'react'
import { atomGlobal_open地図設定 } from '@renderer/hooks/atoms/atomsGlobal'
import { deriv計算_isTabEnabled } from '@renderer/hooks/atoms/deriv計算_is計算可能'

export default function App(): JSX.Element {
  const { setTabIndex, tabIndex } = useApp()
  const { t, i18n } = useTranslation()
  const open地図設定 = useAtomValue(atomGlobal_open地図設定)

  //add 20251209
  // 1. 上部パネルの初期高さを State で管理
  const initialHeight = window.innerHeight * 0.7
  const [topPanelHeight, setTopPanelHeight] = useState(initialHeight)
  const [isDragging, setIsDragging] = useState(false)

  // 2. マウスが押されたときの処理 (ドラッグ開始)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  // 3. マウスが移動したときの処理 (ドラッグ中)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      // ビューポートの原点からのマウスのY座標
      const newHeight = e.clientY

      // パネルの最小高さを設定 (例: 200px)
      const minHeight = 200
      const maxHeight = window.innerHeight - minHeight

      // 最小・最大高さを超えないように制限
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setTopPanelHeight(newHeight)
      }
    },
    [isDragging]
  )

  // 4. マウスが離れたときの処理 (ドラッグ終了)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 5. グローバルなイベントリスナーの設定
  useEffect(() => {
    if (isDragging) {
      // ドラッグ中はbody全体でmousemoveとmouseupを監視
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // クリーンアップ関数
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <I18nextProvider i18n={i18n}>
      <Theme>
        <Stack direction="column" sx={{ height: '100vh' }}>
          {/*<Stack direction="row" sx={{ flexGrow: 1, minHeight: 0 }}>*/}
          <Stack direction="row" sx={{ height: topPanelHeight, flexShrink: 0, minHeight: 0 }}>
            {/* Cesium マップ */}
            <Box sx={{ flexGrow: 1, minWidth: 0, height: '100%', minHeight: 0 }}>
              <Map />
            </Box>

            {/* 放出点の設定 */}
            <Box
              sx={{
                width: open地図設定 ? '250px' : '0px',
                height: '100%',
                overflowY: 'auto',
                flexShrink: 0,
                p: open地図設定 ? 2 : 0,
                display: open地図設定 ? 'block' : 'none',
                borderLeft: open地図設定 ? '1px solid #ccc' : 'none'
              }}
            >
              <Map設定 />
            </Box>
          </Stack>
          {/* add 20251209 */}
          <div
            id="splitter"
            onMouseDown={handleMouseDown} // マウスが押されたときのイベントハンドラ
            style={{
              height: '8px',
              backgroundColor: '#ccc', // 境界線の色
              cursor: 'ns-resize', // マウスカーソルを行リサイズに変更
              flexShrink: 0
            }}
          />

          {/* 下部のタブパネル */}
          {/*<Box sx={{ height: '30vh', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: 0 }}>*/}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
              <Tabs value={tabIndex} onChange={setTabIndex}>
                <Tab label={t('settings')} />
                <Tab label={t('lohdim_input')} variant="scrollable" />
                <Tab label={t('sibyl_input')} variant="scrollable" />
                <Tab label={t('calculate')} />
                <Tab label={t('visualize')} />
              </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', height: '100%' }}>
              <TabPanel value={tabIndex} index={0}>
                <Tab設定 />
              </TabPanel>

              <TabPanel value={tabIndex} index={1}>
                <Tab入力_lohdim />
              </TabPanel>

              <TabPanel value={tabIndex} index={2}>
                <Tab入力_sibyl />
              </TabPanel>

              {/* 計算タブ */}
              <TabPanel value={tabIndex} index={3}>
                <Tab計算 />
              </TabPanel>

              {/* 可視化タブ */}
              <TabPanel value={tabIndex} index={4}>
                <Tab可視化 />
              </TabPanel>
            </Box>
          </Box>
        </Stack>
      </Theme>
    </I18nextProvider>
  )
}
