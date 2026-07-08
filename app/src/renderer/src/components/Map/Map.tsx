import {
  CesiumComponentRef,
  CesiumMovementEvent,
  ImageryLayer,
  ScreenSpaceCameraController,
  Viewer
} from 'resium'
import { Viewer as CesiumViewer, ScreenSpaceEventType, WebMercatorProjection, Rectangle, Math as CesiumMath } from 'cesium'
import { useCallback, useRef, useEffect } from 'react'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { Entity計算領域 } from './Entity計算領域'
import { baseLayer, imageryProviders } from './ImageryLayers'
import { Entity放出点 } from './Entity放出点'
import { CameraFlyTo放出点 } from './CameraFlyTo放出点'
import { useMap } from '@renderer/hooks/components/Map/useMap'
import { atomMap設定_視点リセット, Type放出点経緯度, atomMap設定_放出点セルラベル, atomMap設定_放出点セル } from '@renderer/hooks/atoms/atomsMap設定'
import { Entity可視化タブ } from './Entity可視化タブ'
import {
  HelpOutline,
  Home,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight
} from '@mui/icons-material'
import { Entity建物 } from './Entity建物'
import { useAtomValue, useSetAtom } from 'jotai'
import { atom建物オフセット} from '@renderer/hooks/atoms/atomsMap設定'
import { deriv放出点3D } from '@renderer/hooks/atoms/deriv放出点3D'
import { useTranslation } from 'react-i18next'


// 2D表示の時に地図画像の縦横比が等しくなるようにメルカトル図法にする
// https://community.cesium.com/t/2d-view-3d-view-distortion-in-x/14517/5
const mercatorProjection = new WebMercatorProjection()

/**
 * 地図表示部
 */
export function Map() {
  const refViewer = useRef<CesiumComponentRef<CesiumViewer> | null>(null)
  const { map画像, open地図設定, set放出点, toggleOpen地図設定 } = useMap()
  const { t, i18n: i18nInstance } = useTranslation();
  const 放出点 = useAtomValue(deriv放出点3D);
  const set視点リセット = useSetAtom(atomMap設定_視点リセット);
  const disabledGoHome = !放出点;
  const handle視点リセット = useCallback(() => set視点リセット(new Date().getTime()), []);
  const changeLanguage = (lng: string) => i18nInstance.changeLanguage(lng);
  const set建物オフセット = useSetAtom(atom建物オフセット)
  
  useEffect(() => {
    // 座標計算結果（放出点）が変わったら、Cesiumに描画更新をリクエストする
    if (refViewer.current?.cesiumElement) {
      refViewer.current.cesiumElement.scene.requestRender();
    }
  }, [放出点]);

  const tooltipTitle = (
    <Stack direction="column">
      <Typography variant="body1">{t("translation_label")}</Typography>
      <span>{t("drag_dot")}</span>
      <Typography variant="body1" marginTop={1}>
        {t("rotation_label")}
      </Typography>
      <span>{t("middle_button_drag")}</span>
      <span>{t("ctrl_drag")}</span>
      <span>{t("shift_drag")}</span>
      <Typography variant="body1" marginTop={1}>
        {t("zoom_label")}</Typography>
      <span>{t("wheel_rotation")}</span>
      <span>{t("right_button_drag")}</span>
      <Typography variant="body1" marginTop={1}>
        {t("set_release_point_label")}
      </Typography>
      <span>{t("double_click_dot")}</span>
    </Stack>
  );

  const containerRef = useRef<HTMLDivElement | null>(null)
  
  const resizeViewer = useCallback(() => {
  const viewer = refViewer.current?.cesiumElement
  if (!viewer) return

  // レイアウトが確定した後に叩く
  requestAnimationFrame(() => {
    viewer.cesiumWidget.resize()
    viewer.scene.requestRender()

    requestAnimationFrame(() => {
      viewer.cesiumWidget.resize()
      viewer.scene.requestRender()
    })
  })
}, [])


  useEffect(() => {
    const el = containerRef.current
    if (!el) return
  
    const ro = new ResizeObserver(() => resizeViewer())
    ro.observe(el)
  
    resizeViewer()

    return () => ro.disconnect()
  }, [resizeViewer])


  return (
    <Box ref={containerRef} sx={{ position: 'relative', flexGrow: 1, width: '100%',height:'100%',minHeight:0,display:'flex',minWidth:0,':hover .map-hover-buttons': { opacity: 1 } }}>
      <Viewer
        style={{ width:'100%',height: '100%' }}
        infoBox={false}
        selectionIndicator={false}
        ref={(ref) => {
          refViewer.current = ref
          if (!ref?.cesiumElement) return

          resizeViewer()

          ref.cesiumElement.screenSpaceEventHandler.removeInputAction(
            ScreenSpaceEventType.LEFT_CLICK
          )
          ref.cesiumElement.screenSpaceEventHandler.removeInputAction(
            ScreenSpaceEventType.LEFT_DOUBLE_CLICK
          )
        }}
        onMouseDown={() => {
          if (refViewer.current?.cesiumElement?.container) {
            refViewer.current.cesiumElement.container.focus()
          }
        }}
        tabIndex={0}
        keyboardEvent={false}
        fullscreenButton={false}
        baseLayerPicker={false}
        timeline={false}
        animation={false}
        homeButton={false}
        vrButton={false}
        geocoder={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        full
        //baseLayer={baseLayer}
        selectedEntity={undefined}
        mapProjection={mercatorProjection}
        requestRenderMode={true}
        onDoubleClick={(e) => handle放出点選択(e, refViewer, set放出点)}
      >
        <ImageryLayer key={map画像} imageryProvider={imageryProviders[map画像]} />
        <CameraFlyTo放出点 />
        <ScreenSpaceCameraController
          inertiaZoom={0.5}
          minimumZoomDistance={1e2}
          maximumZoomDistance={2e7}
        />
        <Entity放出点 />
        <Entity建物 />
        <Entity計算領域 />
        <Entity可視化タブ />
      </Viewer>

      {/* ホバー時に表示するボタンコンテナ */}
      <Box
        className="map-hover-buttons"
        sx={{
          position: 'absolute',
          top: 0,
          right: '0', // 言語ボタンの幅に合わせて右にずらす
          background: '#fffb',
          borderRadius: '0 0 0 10px',
          p: 1,
          display: 'flex',
          gap: 1,
          zIndex: 100,
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <IconButton color="primary" onClick={handle視点リセット} disabled={disabledGoHome}>
          <Home />
        </IconButton>
        <IconButton color="primary" onClick={toggleOpen地図設定}>
          {open地図設定 ? <KeyboardDoubleArrowRight /> : <KeyboardDoubleArrowLeft />}
        </IconButton>
        <IconButton color="primary" sx={{ cursor: 'auto' }}>
          
          <Tooltip enterDelay={0} disableInteractive title={tooltipTitle}>
            <HelpOutline />
          </Tooltip>
        </IconButton>
      </Box>
    </Box>
  )
}


/**
 * ダブルクリック時の放出点選択処理
 */
function handle放出点選択(
  e: CesiumMovementEvent,
  refViewer: React.RefObject<CesiumComponentRef<CesiumViewer>>,
  set経緯度: (経緯度: Type放出点経緯度) => void,
) {

  const viewer = refViewer.current?.cesiumElement
  if (!viewer || !e.position) return
  const ellipsoid = viewer.scene.globe.ellipsoid
  const cartesian = viewer.camera.pickEllipsoid(e.position, ellipsoid)
  
  if (cartesian) {
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);
    const 経度 = CesiumMath.toDegrees(cartographic.longitude);
    const 緯度 = CesiumMath.toDegrees(cartographic.latitude);
    set経緯度({ 緯度, 経度 });
  }
}

/**
 * 視点リセットボタン
 */
export function HomeIcon() {
  const 放出点 = useAtomValue(deriv放出点3D)
  const set視点リセット = useSetAtom(atomMap設定_視点リセット)
  const disabledGoHome = !放出点
  const handle視点リセット = useCallback(() => set視点リセット(new Date().getTime()), [])
  return (
    <IconButton color="primary" onClick={handle視点リセット} disabled={disabledGoHome}>
      <Home />
    </IconButton>
  )
}

/**
 * 地図設定画面の開閉ボタン
 */
export function CollapseIcon({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <IconButton color="primary" onClick={onClick}>
      {collapsed ? <KeyboardDoubleArrowLeft /> : <KeyboardDoubleArrowRight />}
    </IconButton>
  )
}

/**
 * 地図の操作方法を表示するアイコン
 */
export function HelpIcon() {
  const {t} = useTranslation()

  return (
    <IconButton color="primary" sx={{ cursor: 'auto' }}>
      <Tooltip
        enterDelay={0}
        disableInteractive
        title={
          <Stack direction="column">
            <Typography variant="body1">{t("translation_label")}</Typography>
            <span>{t("drag_dot")}</span>
            <Typography variant="body1" marginTop={1}>
              {t("rotation_label")}
            </Typography>
            <span>{t("middle_button_drag")}</span>
            <span>{t("ctrl_drag")}</span>
            <span>{t("shift_drag")}</span>
            <Typography variant="body1" marginTop={1}>
              {t("zoom_label")}
            </Typography>
            <span>{t("wheel_rotation")}</span>
            <span>{t("right_button_drag")}</span>
            <Typography variant="body1" marginTop={1}>
              {t("set_release_point_label")}
            </Typography>
            <span>{t("double_click_dot")}</span>
          </Stack>
        }
      >
        <HelpOutline />
      </Tooltip>
    </IconButton>
  )
}
