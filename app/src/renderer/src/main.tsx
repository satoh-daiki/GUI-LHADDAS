import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { buildModuleUrl } from '@cesium/engine'

// ----------------------------------------------------------------------
// エラー表示用のヘルパー関数
// ----------------------------------------------------------------------
function showFatal(e: unknown) {
  const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack ?? ''}` : String(e)
  document.body.innerHTML = `<pre style="white-space:pre-wrap; padding:12px; font-family:monospace;">FATAL:\n${msg}</pre>`
}

// ----------------------------------------------------------------------
// メイン処理
// ----------------------------------------------------------------------
async function bootstrap() {
  try {
    document.title = `GUI for LHADDAS Ver. ${__APP_VERSION__}`

    // 1. OS判定
    const isMac = navigator.userAgent.indexOf('Mac') !== -1
    let baseUrl: string

    // 2. パスの決定（ここでMacとWindowsを明確に分けます）
    if (isMac) {
      //以下どちらのbaseUrlを使用してもビルドできない
      baseUrl = './cesium/'
      //baseUrl = (window as any).paths?.cesiumBaseUrl ?? './cesium';
    } else {
      // ★ Windowsの場合：元のコードのロジックをそのまま採用
      // Electron側から渡されたパスがあれば使い、なければ ./cesium を使う
      baseUrl = (window as any).paths?.cesiumBaseUrl ?? './cesium'
    }

    // 決定したパスを適用
    ;(window as any).CESIUM_BASE_URL = baseUrl
    buildModuleUrl.setBaseUrl(baseUrl)

    // 3. アプリの読み込みと起動
    // Windows/Mac共通の処理です
    const { default: App } = await import('./App')

    if (typeof App !== 'function') {
      throw new Error(`App default export is not a React component.`)
    }

    const rootEl = document.getElementById('root')
    if (!rootEl) throw new Error('#root not found')

    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (e) {
    showFatal(e)
  }
}

// 起動
bootstrap()
