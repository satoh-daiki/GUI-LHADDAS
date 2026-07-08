import React, { useState, useEffect, useCallback } from 'react'
import {
  Stack,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTranslation } from 'react-i18next'
import { useAtom, useSetAtom } from 'jotai'
import { formDataAtom, FormData } from '../../hooks/atoms/atoms入力_sibyl.ts'
import { Message } from './Message'
import { useTab計算 } from '@renderer/hooks/components/Tab計算/useTab計算'
import { formatSibylData } from '../common/formatSibylData'
import PopupNotification from '../PopupNotification'
import OutputFileModal from '../OutputFileModal'
import { sibylFileContentAtom } from '../../hooks/atoms/atomsInputFileContent'
import { parseIniFormat } from '../../components/common/parseIniFormat'
import { mapSibylDataToFormData } from '../../components/common/sibylMapper'
import { validationErrorsAtom } from '../../hooks/atoms/atoms入力_sibyl.ts'
import { validateSibyl } from '../../utils/validation/validation'
import {
  convertToSibylFormat,
  convertNestedJsonToSibyl
} from '../../components/common/convertToOriginalFormatSIBYL'
import {
  atomMap設定_放出点セル,
  atomMap設定_放出点セルラベル
} from '../../hooks/atoms/atomsMap設定'
import { atom計算_Sibyl入力フォルダ } from '@renderer/hooks/atoms/atoms計算タブ'
import { atomInputRefreshTrigger } from '../../hooks/atoms/deriv計算_入力'
import { atomMapエラー通知 } from '../../hooks/atoms/atomsMap設定'
import { NUCLIDE_LIST, DOSE_RATE_TYPES } from '../../constants/nuclides'

// ===========================================
// 入力チェック用ヘルパー関数
// ===========================================

/**
 * 【正の整数】および【ゼロもしくは正の整数】用
 * 許可: 数字のみ (0-9)
 * 禁止: マイナス符号、小数点
 */
const isValidUnsignedInteger = (value: string): boolean => {
  return /^\d*$/.test(value)
}

/**
 * 【実数】用
 * 許可: 数字、マイナス符号、小数点
 * (入力途中を考慮して、末尾のドットなども許可)
 */
const isValidReal = (value: string): boolean => {
  return /^-?\d*\.?\d*$/.test(value)
}

/**
 * 【それ以外の整数】用
 * 許可: 数字、マイナス符号
 * 禁止: 小数点
 */
const isValidInteger = (value: string): boolean => {
  return /^-?\d*$/.test(value)
}

// ===========================================
// Tab入力_sibyl コンポーネントの外に出されたコンポーネント定義
// ===========================================

/**
 * 領域入力用のコンポーネント（線源領域、標的領域などで共通）
 * @param {object} props - コンポーネントのプロパティ
 * @param {boolean} props.isSource - 線源領域の入力かどうか
 * @param {FormData} props.formData - フォームデータ
 * @param {Function} props.handlers - イベントハンドラオブジェクト
 */
const RegionInput = React.memo(
  ({
    isSource,
    formData,
    handlers
  }: {
    isSource: boolean
    formData: FormData
    handlers: {
      handleSourceXStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleSourceXEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleSourceYStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleSourceYEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleSourceZStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleSourceZEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleTargetAreaXStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleTargetAreaXEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleTargetAreaYStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleTargetAreaYEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleTargetAreaZStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleTargetAreaZEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
    }
  }) => {
    const { t, i18n } = useTranslation()
    // 適切なデータとハンドラを取得するロジックをここに定義
    const section = isSource ? formData.source : formData.target

    const xStartValue = section.xStart
    const xEndValue = section.xEnd
    const yStartValue = section.yStart
    const yEndValue = section.yEnd
    // 標的領域ではZ座標はないが、コード上は存在するため、変数だけ定義
    const zStartValue = section.zStart
    const zEndValue = section.zEnd

    const xStartHandler = isSource
      ? handlers.handleSourceXStartChange
      : handlers.handleTargetAreaXStartChange
    const xEndHandler = isSource
      ? handlers.handleSourceXEndChange
      : handlers.handleTargetAreaXEndChange
    const yStartHandler = isSource
      ? handlers.handleSourceYStartChange
      : handlers.handleTargetAreaYStartChange
    const yEndHandler = isSource
      ? handlers.handleSourceYEndChange
      : handlers.handleTargetAreaYEndChange
    const zStartHandler = isSource
      ? handlers.handleSourceZStartChange
      : handlers.handleTargetAreaZStartChange
    const zEndHandler = isSource
      ? handlers.handleSourceZEndChange
      : handlers.handleTargetAreaZEndChange

    return (
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={3.5}>
          <Typography variant="body2">{t('x_direction')}</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            size="small"
            placeholder="開始セル番号"
            fullWidth
            value={xStartValue}
            onChange={xStartHandler}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Grid>
        <Grid item xs={4.5}>
          <TextField
            size="small"
            placeholder="終端セル番号"
            fullWidth
            value={xEndValue}
            onChange={xEndHandler}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Grid>

        <Grid item xs={3.5}>
          <Typography variant="body2">{t('y_direction')}</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            size="small"
            fullWidth
            value={yStartValue}
            onChange={yStartHandler}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Grid>
        <Grid item xs={4.5}>
          <TextField
            size="small"
            fullWidth
            value={yEndValue}
            onChange={yEndHandler}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Grid>

        {/* 標的領域にはZ軸がないため、線源領域のみ表示 */}
        {isSource && (
          <>
            <Grid item xs={3.5}>
              <Typography variant="body2">{t('z_direction')}</Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                value={zStartValue}
                onChange={zStartHandler}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>
            <Grid item xs={4.5}>
              <TextField
                size="small"
                fullWidth
                value={zEndValue}
                onChange={zEndHandler}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>
          </>
        )}
      </Grid>
    )
  }
)
RegionInput.displayName = 'RegionInput'

/**
 * 障害物・計算領域の入力部分
 * @param {object} props - コンポーネントのプロパティ
 * @param {FormData} props.formData - フォームデータ
 * @param {Function} props.handlers - イベントハンドラオブジェクト
 */
const BottomSection = React.memo(
  ({
    formData,
    handlers
  }: {
    formData: FormData
    handlers: {
      handleGammaChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
      handleEffectiveDensityChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleZMaxCellChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleCalcAreaXStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleCalcAreaXEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleCalcAreaYStartChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
      handleCalcAreaYEndChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void
    }
  }) => {
    const { t, i18n } = useTranslation()

    return (
      <Grid container>
        {/* 障害物 */}
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('obstacle')}
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flexGrow: 1.0 }}>
                {t('gamma_attenuation_coefficient')}
              </Typography>
              <TextField
                size="small"
                sx={{ width: '40%', mr: 5 }}
                value={formData.obstacle.gamma}
                onChange={handlers.handleGammaChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flexGrow: 1.0 }}>
                {t('effective_density')}
              </Typography>
              <TextField
                size="small"
                sx={{ width: '40%', mr: 5 }}
                value={formData.obstacle.effectiveDensity}
                onChange={handlers.handleEffectiveDensityChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flexGrow: 1.0 }}>
                {t('z_max_cell_number')}
              </Typography>
              <TextField
                size="small"
                sx={{ width: '40%', mr: 5 }}
                value={formData.obstacle.zMaxCell}
                onChange={handlers.handleZMaxCellChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Box>
          </Stack>
        </Grid>

        {/* 計算領域 */}
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('calc_region')}
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={4}>
              {/* 空白 */}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" align="center" sx={{ fontSize: '0.75rem' }}>
                {t('start_cell_number')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" align="center" sx={{ fontSize: '0.75rem' }}>
                {t('end_cell_number')}
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2">{t('x_direction')}</Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.calcArea.xStart}
                onChange={handlers.handleCalcAreaXStartChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.calcArea.xEnd}
                onChange={handlers.handleCalcAreaXEndChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2">{t('y_direction')}</Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.calcArea.yStart}
                onChange={handlers.handleCalcAreaYStartChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.calcArea.yEnd}
                onChange={handlers.handleCalcAreaYEndChange}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
)
BottomSection.displayName = 'BottomSection'

// ===========================================
// メインコンポーネント
// ===========================================

/**
 * 入力タブのコンポーネント
 */
export function Tab入力_sibyl(): JSX.Element {
  const { t, i18n } = useTranslation()
  // Jotaiから状態と更新関数を取得
  const [formData, setFormData] = useAtom(formDataAtom)
  const [isDirty, setIsDirty] = useState(false)
  const [isinputdata, setIsinputdata] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [isExportedSuccessfully, setIsExportedSuccessfully] = useState(false)
  const [popup, setPopup] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })

  const [mapError, setMapError] = useAtom(atomMapエラー通知)

  useEffect(() => {
    if (mapError) {
      setPopup({
        isVisible: true,
        message: mapError.message,
        type: mapError.type as 'success' | 'error'
      })
      setMapError(undefined)
    }
  }, [mapError, setMapError])

  // バリデーションエラーポップアップを、新しいエラーが出るたびに上書きする形に再定義
  const showPopup = useCallback(({ message, type }: { message: string, type: 'error' | 'success' }) => {
    // まず現在のポップアップを閉じる
    setPopup(prev => ({ ...prev, isVisible: false }));
  
    // 50ms待ってから、新しいオブジェクトの内容で表示
    setTimeout(() => {
      setPopup({
        isVisible: true,
        message: message,
        type: type,
      });
    }, 50);
  }, [setPopup]);
    
  const handleClosePopup = () => {
    setPopup((prev) => ({ ...prev, isVisible: false }))
  }

  const setFileContent = useSetAtom(sibylFileContentAtom)
  const { sibyl入力フォルダ } = useTab計算()

  const setMap放出点セル = useSetAtom(atomMap設定_放出点セル)
  const setMap放出点セルラベル = useSetAtom(atomMap設定_放出点セルラベル)
  const setSibylPath = useSetAtom(atom計算_Sibyl入力フォルダ)

  const setInputRefresh = useSetAtom(atomInputRefreshTrigger)
  const handleReload = useCallback(async () => {
    if (!sibyl入力フォルダ) return
    const fullPath = window.electronAPI.join(sibyl入力フォルダ, 'SIBYL_input.data')

    try {
      const data = await window.electronAPI.readFile(fullPath)
      const rawData = parseIniFormat(data)
      const nextFormData = mapSibylDataToFormData(rawData)

      const nx = Number(nextFormData.source.xStart)
      const ny = Number(nextFormData.source.yStart)
      const nz = Number(nextFormData.source.zStart)

      if (isNaN(nx) || isNaN(ny) || isNaN(nz)) {
        throw new Error('SIBYLデータの座標値が不正な数値です。')
      }

      setFormData(nextFormData)

      setInputRefresh((prev) => prev + 1)

      setTimeout(() => {
        setMap放出点セル({ x: nx, y: ny, z: nz })
        setMap放出点セルラベル({ x: String(nx), y: String(ny), z: String(nz) })
      }, 200)
      //setPopup({ isVisible: true, message: '再読み込みが完了しました', type: 'success' });
      showPopup({ message: `${t('reload_success')}`, type: 'success' })
      setIsDirty(false)
    } catch (error: any) {
      showPopup({
        message: error.message || '再読み込みに失敗しました',
        type: 'error'
      })
    }
  }, [sibyl入力フォルダ, setFormData, setMap放出点セル, setMap放出点セルラベル, setSibylPath])

  useEffect(() => {
    if (sibyl入力フォルダ) {
      const fullPath = window.electronAPI.join(sibyl入力フォルダ, 'SIBYL_input.data')
      window.electronAPI
        .readFile(fullPath)
        .then((data) => {
          // Safety: readFile should return string; guard to avoid runtime errors
          if (typeof data !== 'string') {
            throw new Error('readFile did not return a string')
          }

          setIsinputdata(true)

          const rawData = parseIniFormat(data)
          const formData = mapSibylDataToFormData(rawData)
          setFormData(formData)

          //to make original temporary data to use temp view
          //const temporarytext = convertToSibylFormat(formData)
          const temporarytext = convertNestedJsonToSibyl(formData)
          const tempdata_fullPath = window.electronAPI.join(
            sibyl入力フォルダ,
            'tempSIBYL_input.data'
          )
          window.electronAPI.writeFile(tempdata_fullPath, temporarytext)
          //inputファイルは存在しているけど、値に欠落があった場合に補完した情報を保存する
          //const inputdata_fullPath = window.electronAPI.join(sibyl入力フォルダ, 'SIBYL_input.data')
          //window.electronAPI.writeFile(inputdata_fullPath,temporarytext)
        })
        .catch((error) => {
          //to load default file

          setIsinputdata(false)
          const fullPath = window.electronAPI.join(
            window.paths.templateDir,
            'SIBYL_input_template.data'
          )
          window.electronAPI
            .readFile(fullPath)
            .then((data) => {
              if (typeof data !== 'string') {
                throw new Error('readFile did not return a string')
              }

              const rawData = parseIniFormat(data)

              const formData = mapSibylDataToFormData(rawData)
              setFormData(formData)

              //to make original temporary data to use temp view
              const temporarytext = convertNestedJsonToSibyl(formData)
              //const temporarytext = convertToSibylFormat(formData)
              const tempdata_fullPath = window.electronAPI.join(
                sibyl入力フォルダ,
                'tempSIBYL_input.data'
              ) //const inputdata_fullPath = window.electronAPI.join(sibyl入力フォルダ, 'SIBYL_input.data')
              window.electronAPI.writeFile(tempdata_fullPath, temporarytext) //window.electronAPI.writeFile(inputdata_fullPath,temporarytext)
            })
            .catch((error) => {
              setFileContent({})
            })
        })
    }
    //add 20251218
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 変更があり、かつエクスポートされていない場合のみ警告
      if (isDirty && !isExportedSuccessfully) {
        e.preventDefault()
        e.returnValue = '' // ブラウザ標準のダイアログを表示
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)

  }, [sibyl入力フォルダ, setFileContent, setFormData, isinputdata])

  const nuclideOptions = React.useMemo(() => {
    return [...NUCLIDE_LIST].sort()
  }, [])

  // アコーディオンの開閉状態を管理するstate
  const [expandedRed, setExpandedRed] = useState<boolean>(true) // 必須項目
  const [expandedBlack, setExpandedBlack] = useState<boolean>(false) // 任意項目
  const [validationErrors, setValidationErrors] = useAtom(validationErrorsAtom)

  //add 20251211 for modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')

  // 確認ダイアログを開く関数
  const handleOpenDialog = () => {
    if (isinputdata) {
      //input dataが存在していた場合にはダイアログで確認
      setOpenDialog(true)
    } else {
      //なければそのまま保存
      handleExport()
    }
  }

  // 確認ダイアログを閉じる関数
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleExport = useCallback(async () => {
    //ダイアログが出ていたら閉じる
    handleCloseDialog()
    const errors = validateSibyl(formData)
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      // エラーメッセージの配列を取得
      //const rawMessages = Object.values(errors).map(msg => t(msg));
      const rawMessages = Object.values(errors).map((msg) => {
        try {
          // まずJSONとしてパース
          const parsed = JSON.parse(msg)

          if (parsed.key && parsed.params) {
            // 変数付きで翻訳関数tを呼ぶ
            return t(parsed.key, parsed.params)
          }
        } catch (e) {}

        // JSONでない、または普通のメッセージならそのまま翻訳
        return t(msg)
      })

      // Setを使って重複を削除（同じ文言は1つにまとめる）
      const uniqueMessages = Array.from(new Set(rawMessages))
      // 結合（重複がなければ1行だけになる）
      const errorMessages = uniqueMessages.join('\n')

      showPopup({
        //message: `${t("validation.input_error_prefix")}:\n${errorMessages}`, // 翻訳キーを使用
        message: `${errorMessages}`, // 翻訳キーを使用
        type: 'error'
      })
      return
    }

    //to original string
    const originaltext = convertNestedJsonToSibyl(formData)

    const fullPath = window.electronAPI.join(sibyl入力フォルダ, 'SIBYL_input.data')
    try {
      //await window.electronAPI.writeInputFile(sibyl入力フォルダ, 'SIBYL_input.data', formatSibylData(formData));
      await window.electronAPI.writeFile(fullPath, originaltext)
      setIsExportedSuccessfully(true)
      setIsinputdata(true)
      setIsDirty(false)
      showPopup({
        //message: 'SIBYL入力ファイルの書き込みに成功しました',
        message: `${t('sibylexport_success')}`,
        type: 'success'
      })
    } catch (error) {
      setIsExportedSuccessfully(false)
      showPopup({
        //message: `SIBYL入力ファイルの書き込みに失敗しました: '${error.message || '不明なエラー'}'`,
        message: `${t('sibylexport_failure')}${error.message || '不明なエラー'}`,
        type: 'success'
      })

      return
    }
  }, [
    formData,
    sibyl入力フォルダ,
    setValidationErrors,
    showPopup,
    setIsExportedSuccessfully,
    setIsDirty,
    isinputdata
  ])

  const handleShowContent = useCallback(async () => {
    // フォルダが指定されていない場合のチェック
    if (!sibyl入力フォルダ) {
      showPopup({
        //message: '入力フォルダが指定されていません。',
        message: `${t('sibyl_inputfolder_unknown')}`,
        type: 'error'
      })
      return
    }

    try {
      const fullPath = window.electronAPI.join(sibyl入力フォルダ, 'tempSIBYL_input.data')

      const data = await window.electronAPI.readFile(fullPath)

      // モーダルに内容を設定して開く
      setModalContent(data)
      setIsModalOpen(true)
    } catch (error: any) {
      showPopup({
        //message: `出力ファイルの内容の読み込みに失敗しました: ${error.message || 'ファイルが存在しないか、読み取りエラーです。'}`,
        message: `${t('sibyl_tempfile_failure')} ${error.message || 'ファイルが存在しないか、読み取りエラーです。'}`,
        type: 'error'
      })
    }
  }, [sibyl入力フォルダ, showPopup, setIsModalOpen, setModalContent]) // 依存配列

  const handleRedAccordionChange = () => {
    setExpandedRed(!expandedRed)
  }
  const handleBlackAccordionChange = () => {
    setExpandedBlack(!expandedBlack)
  }

  // ===========================================
  // ヘルパー関数群 (Jotai Atomの更新ロジック)
  // ===========================================

  // 保存処理を共通化
  const saveTotemp = useCallback(
    async (currentData: FormData) => {
      if (!sibyl入力フォルダ) return
      const originalText = convertNestedJsonToSibyl(currentData)

      const fullPath = window.electronAPI.join(sibyl入力フォルダ, 'tempSIBYL_input.data')
      try {
        await window.electronAPI.writeFile(fullPath, originalText)
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    },
    [sibyl入力フォルダ]
  )
  // トップレベルのフィールドを更新するヘルパー


  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      // 関数が呼ばれた瞬間の最新データを作成
      const next = { ...formData, [field]: value };
  
      // State更新と外部保存
      setFormData(next);
      saveTotemp(next);
      setIsDirty(true);
  
      // バリデーションを実行（validation.ts の蓄積ロジックを活かす）
      const errors = validateSibyl(next);
      setValidationErrors(errors);
  
      // まとめて表示命令を1回だけ出す
      if (Object.keys(errors).length > 0) {
        // 全項目の全エラーを改行で結合
        const combinedMsg = Object.values(errors).join('\n');
        showPopup({ message: combinedMsg, type: 'error' });
      } else {
        //showPopup({ message: '', type: 'success' });
        handleClosePopup();
      }
    },
    [formData, setFormData, saveTotemp, setValidationErrors, showPopup, t]
  );


  // ネストされたフィールド (領域や障害物) を更新するヘルパー

  const updateNestedField = useCallback(
  (section: keyof FormData, field: string, value: string) => {
    // 最新の階層構造をコピーして作成
    const next = {
      ...formData,
      [section]: {
        ...(formData[section as keyof FormData] as object),
        [field]: value
      }
    } as FormData;

    // 連動ロジック(計算領域やzMaxCell)
    if (
      section === 'target' &&
      ['xStart', 'xEnd', 'yStart', 'yEnd'].includes(field)
    ) {
      next.calcArea = { ...next.calcArea, [field]: value };
    }

    if (section === 'source' && field === 'zEnd') {
      next.obstacle = { ...next.obstacle, zMaxCell: value };
    }

    // 更新・保存の実行
    setFormData(next);
    saveTotemp(next);
    setIsDirty(true);

    // バリデーションとポップアップ表示
    const errors = validateSibyl(next);
    setValidationErrors(errors);

    

    if (Object.keys(errors).length > 0) {
      // 翻訳済みのメッセージを全件結合
      const combinedMsg = Object.values(errors).map(msg => {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.key && parsed.params) return t(parsed.key, parsed.params);
        } catch (e) {}
        return t(msg);
      }).join('\n');

      showPopup({ message: combinedMsg, type: 'error' });
    } else {
      // エラーがゼロならポップアップをクリアする
      //showPopup({ message: '', type: 'success' });
      handleClosePopup();
    }
  },
  [formData, setFormData, saveTotemp, setValidationErrors, showPopup, t]
);

  // ===========================================
  // イベントハンドラ (すべてのハンドラを定義)
  // useCallbackを使用して、子コンポーネントに渡すハンドラが不必要に再生成されないようにします
  // ===========================================

  // 基本情報
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // 文字列はそのまま許可
      updateField('title', event.target.value)
    },
    [updateField]
  )

  const handleNuclideChange = useCallback(
    (event: { target: { value: string | unknown } }) => {
      updateField('nuclide', event.target.value as string)
    },
    [updateField]
  )

  const handleDoseRateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateField('doseRateType', event.target.value)
    },
    [updateField]
  )

  // セルの水平方向幅 (正の整数)
  // ※"正の整数"指定のため、マイナス符号・小数点は入力禁止 (UnsignedInteger使用)
  const handleCellSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidUnsignedInteger(val)) {
        updateField('cellSize', val)
      }
    },
    [updateField]
  )

  // 線源領域
  // X, Y は「それ以外」の区分なので通常の整数（マイナス許可、小数禁止）
  const handleSourceXStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('source', 'xStart', val)
      }
    },
    [updateNestedField]
  )
  const handleSourceXEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('source', 'xEnd', val)
      }
    },
    [updateNestedField]
  )
  const handleSourceYStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('source', 'yStart', val)
      }
    },
    [updateNestedField]
  )
  const handleSourceYEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('source', 'yEnd', val)
      }
    },
    [updateNestedField]
  )

  // Z開始 (0もしくは正の整数) -> UnsignedInteger
  const handleSourceZStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidUnsignedInteger(val)) {
        updateNestedField('source', 'zStart', val)
      }
    },
    [updateNestedField]
  )

  // Z終了 (正の整数) -> UnsignedInteger
  const handleSourceZEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidUnsignedInteger(val)) {
        updateNestedField('source', 'zEnd', val)
      }
    },
    [updateNestedField]
  )

  // 標的領域 (それ以外 -> 整数)
  const handleTargetAreaXStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('target', 'xStart', val)
      }
    },
    [updateNestedField]
  )
  const handleTargetAreaXEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('target', 'xEnd', val)
      }
    },
    [updateNestedField]
  )
  const handleTargetAreaYStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('target', 'yStart', val)
      }
    },
    [updateNestedField]
  )
  const handleTargetAreaYEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('target', 'yEnd', val)
      }
    },
    [updateNestedField]
  )
  const handleTargetAreaZStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('target', 'zStart', val)
      }
    },
    [updateNestedField]
  )
  const handleTargetAreaZEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('target', 'zEnd', val)
      }
    },
    [updateNestedField]
  )

  // 障害物
  // gamma（実数 -> 小数許可）
  const handleGammaChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidReal(val)) {
        updateNestedField('obstacle', 'gamma', val)
      }
    },
    [updateNestedField]
  )
  // effectiveDensity（実数 -> 小数許可）
  const handleEffectiveDensityChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidReal(val)) {
        updateNestedField('obstacle', 'effectiveDensity', val)
      }
    },
    [updateNestedField]
  )
  // zMaxCell（それ以外 -> 整数）
  const handleZMaxCellChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('obstacle', 'zMaxCell', val)
      }
    },
    [updateNestedField]
  )

  // 計算領域（それ以外 -> 整数）
  const handleCalcAreaXStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('calcArea', 'xStart', val)
      }
    },
    [updateNestedField]
  )
  const handleCalcAreaXEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('calcArea', 'xEnd', val)
      }
    },
    [updateNestedField]
  )
  const handleCalcAreaYStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('calcArea', 'yStart', val)
      }
    },
    [updateNestedField]
  )
  const handleCalcAreaYEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value
      if (isValidInteger(val)) {
        updateNestedField('calcArea', 'yEnd', val)
      }
    },
    [updateNestedField]
  )
  // ===========================================

  // RegionInputに渡すハンドラ群をオブジェクトにまとめる
  const regionInputHandlers = {
    handleSourceXStartChange,
    handleSourceXEndChange,
    handleSourceYStartChange,
    handleSourceYEndChange,
    handleSourceZStartChange,
    handleSourceZEndChange,
    handleTargetAreaXStartChange,
    handleTargetAreaXEndChange,
    handleTargetAreaYStartChange,
    handleTargetAreaYEndChange,
    handleTargetAreaZStartChange,
    handleTargetAreaZEndChange
  }

  // BottomSectionに渡すハンドラ群をオブジェクトにまとめる
  const bottomSectionHandlers = {
    handleGammaChange,
    handleEffectiveDensityChange,
    handleZMaxCellChange,
    handleCalcAreaXStartChange,
    handleCalcAreaXEndChange,
    handleCalcAreaYStartChange,
    handleCalcAreaYEndChange
  }

  return (
    <Box sx={{ position: 'relative', pb: 8 }}>
      <Stack spacing={3} sx={{ pt: 3, pb: 2, px: 2, maxWidth: 1000, mx: 'auto' }}>
        <PopupNotification
          isVisible={popup.isVisible}
          message={popup.message}
          type={popup.type}
          onClose={handleClosePopup}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            marginTop: 2,
            paddingRight: 3
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleShowContent}
            sx={{ zIndex: 1, marginRight: 2 }}
          >
            {t('show_content')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            //onClick={handleExport}
            onClick={handleOpenDialog}
            sx={{ zIndex: 1, marginRight: 2 }}
          >
            {t('export')}
          </Button>
          <Button
            variant="outlined"
            color="info"
            size="large"
            onClick={handleReload}
            sx={{ zIndex: 1 }}
          >
            {t('reload')}
          </Button>
        </Box>
        {/*必須項目アコーディオン*/}
        <Accordion
          expanded={expandedRed}
          onChange={handleRedAccordionChange}
          sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="red-content"
            id="red-header"
            sx={{ bgcolor: '#ffebee' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {t('required_fields')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box /> {/* スペースのため */}
              {/* add title for required field */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ minWidth: 100 }}>
                  {t('title')}
                </Typography>
                <TextField
                  size="small"
                  placeholder="テキスト"
                  fullWidth
                  sx={{ ml: 2 }}
                  value={formData.title}
                  onChange={handleTitleChange}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* 放射性核種 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ minWidth: 100 }}>
                  {t('radionuclide')}
                </Typography>
                <FormControl size="small" sx={{ ml: 2, flexGrow: 1 }}>
                  <Select
                    value={formData.nuclide}
                    onChange={handleNuclideChange}
                    displayEmpty
                    fullWidth
                  >
                    {nuclideOptions.map((nuclide) => (
                      <MenuItem key={nuclide} value={nuclide}>
                        {nuclide}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {/* 出力する線量率 & セルの水平方向幅*/}
              <Grid container spacing={0} alignItems="flex-end">
                {/* 出力する線量率*/}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ minWidth: 100 }}>
                      {t('output_dose_rate')}
                    </Typography>
                    <RadioGroup
                      row
                      value={formData.doseRateType}
                      onChange={handleDoseRateChange}
                      sx={{ ml: 2 }}
                    >
                      <FormControlLabel
                        value="ambient"
                        control={<Radio size="small" />}
                        label={
                          <Typography variant="body2">
                            {t('ambient_dose_equivalent_rate')}
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="airkerma"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2">{t('air_kerma_rate')}</Typography>}
                      />
                    </RadioGroup>
                  </Box>
                </Grid>

                {/* セルの水平方向幅 */}
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ minWidth: 180 }}>
                      {t('cell_horizontal_width')}
                    </Typography>
                    <TextField
                      size="small"
                      sx={{ flexGrow: 1 }}
                      value={formData.cellSize}
                      onChange={handleCellSizeChange}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Grid container>
                {/* 線源領域 */}
                <Grid item xs={6} sx={{ paddingRight: 6 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {t('source_region')}
                  </Typography>
                  <RegionInput isSource={true} formData={formData} handlers={regionInputHandlers} />
                </Grid>
                {/* 標的領域 */}
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {t('target_region')}
                  </Typography>
                  <RegionInput
                    isSource={false}
                    formData={formData}
                    handlers={regionInputHandlers}
                  />
                </Grid>
              </Grid>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedBlack}
          onChange={handleBlackAccordionChange}
          sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="black-content"
            id="black-header"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {t('optional_fields')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 4 }}>
            <Stack spacing={3}>
              <BottomSection formData={formData} handlers={bottomSectionHandlers} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
      <Message />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          marginTop: 2,
          paddingRight: 3
        }}
      >
        <OutputFileModal
          isOpen={isModalOpen}
          content={modalContent}
          filename="SIBYL_input.data"
          onClose={() => setIsModalOpen(false)}
          t={t}
        />
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t('dialog_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('dialog_content_text_sibyl')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleExport} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
