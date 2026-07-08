import React from 'react'

/**
 * 出力ファイル内容表示用モーダルコンポーネント (インラインCSS/Reactベース)
 * @param {boolean} isOpen - モーダルを表示するかどうか
 * @param {string} content - 表示するファイルの内容（テキスト）
 * @param {function} onClose - モーダルを閉じるためのコールバック関数
 * @param {function} t - 翻訳関数 (t("...") のために使用)
 */
const OutputFileModal = ({ isOpen, content, filename, onClose, t }) => {
  if (!isOpen) {
    return null
  }

  // モーダル背景（画面全体を覆う暗いレイヤー）のスタイル
  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明の黒
    zIndex: 1050, // PopupNotification (zIndex: 1000) より手前に
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  // モーダルコンテナ（白い箱）のスタイル
  const modalStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px', // 最大幅を設定
    maxHeight: '90%',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column'
  }

  // 内容表示エリアのスタイル
  const contentAreaStyle = {
    marginTop: '15px',
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #ddd',
    backgroundColor: '#f8f8f8',
    overflowY: 'auto', // 内容が長すぎる場合はスクロール可能にする
    maxHeight: '60vh', // 最大の高さをビューポートの60%に制限
    fontFamily: 'monospace', // テキストファイルらしく等幅フォントを使用
    whiteSpace: 'pre-wrap' // 改行とスペースを保持する
  }

  // ボタンのスタイル
  const buttonStyle = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'flex-end'
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      {/* モーダル内部をクリックしても閉じないようにイベント伝播を停止 */}
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* タイトル */}
        <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          {filename}
        </h3>

        {/* 閉じるボタン (角) */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          &times;
        </button>

        {/* 内容表示エリア */}
        <div style={contentAreaStyle}>{content}</div>

        {/* アクションエリア */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={buttonStyle} onClick={onClose}>
            {t ? t('close') : '閉じる'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OutputFileModal
