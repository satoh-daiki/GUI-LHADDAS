import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * トースト通知スタイルのポップアップコンポーネント
 * @param {boolean} isVisible - ポップアップを表示するかどうか
 * @param {string} message - 表示するメッセージ
 * @param {'success' | 'error'} type - ポップアップの種類 (色を変えるために使用)
 * @param {function} onClose - ポップアップを閉じるためのコールバック関数
 */
const PopupNotification = ({ isVisible, message, type, onClose }) => {
  const { t } = useTranslation()
  // 6秒後に自動的にポップアップを閉じる処理
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 6000)

    // クリーンアップ関数（コンポーネントがアンマウントされるか、isVisibleが変更される前に実行）
    return () => clearTimeout(timer)
  }, [isVisible, onClose])

  if (!isVisible) {
    return null
  }

  // タイプに応じたスタイル設定
  const style = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: type === 'success' ? '#4CAF50' : '#F44336',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: '1000',
    animation: 'fadeIn 0.5s'
  }

  return (
    <div style={style}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>
        {type === 'success' ? t('status.success') : t('status.error')}
      </p>
      <p style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0' }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          position: 'absolute',
          top: '5px',
          right: '5px'
        }}
      >
        &times;
      </button>
    </div>
  )
}

export default PopupNotification
