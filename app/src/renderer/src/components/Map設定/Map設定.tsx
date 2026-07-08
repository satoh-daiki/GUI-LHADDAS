import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Button,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMap設定 } from '@renderer/hooks/components/Map設定/useMap設定'
import { Type放出点セルラベル, Type画像 } from '@renderer/hooks/atoms/atomsMap設定'
import { useTranslation } from 'react-i18next';
import { useSetAtom, useAtomValue, useAtom, atom } from 'jotai';
import { atom建物オフセット} from '@renderer/hooks/atoms/atomsMap設定'
import { atom計算_LohdimLes入力フォルダ } from '@renderer/hooks/atoms/atoms計算タブ'
import { atom計算結果移動量 } from '@renderer/hooks/atoms/atomsMap設定'
import React, { useState, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

const ipcRenderer = window.electronAPI.ipcRenderer


/**
 * 地図画面右の放出点などを設定するパネル
 */
export function Map設定() {
  const [fileContent, setFileContent] = useState(null);
  const lohdimLes入力フォルダ = useAtomValue(atom計算_LohdimLes入力フォルダ);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCorrectionDialog, setOpenCorrectionDialog] = useState(false);
  
  const {t} = useTranslation();
  const {
    open,
    disableSet放出点セル,
    放出点経緯度ラベル: { 緯度, 経度 },
    放出点セルラベル: { x, y, z },
    高さ,
    画像,
    error緯度,
    error経度,
    errorX,
    errorY,
    errorZ,
    set放出点経緯度ラベル,
    set放出点セルラベル,
    set画像
  } = useMap設定()
  const set建物オフセット = useSetAtom(atom建物オフセット)
  const [移動量, set移動量] = useAtom(atom計算結果移動量)
  const moveAmount = 10;

  const handleMove = (dx: number, dy: number) => {
    // 地図上の表示位置（建物オフセット）を更新
    set建物オフセット(prev => ({ 
        x: (Number(prev.x) || 0) + dx, 
        y: (Number(prev.y) || 0) + dy
    }));
    
    // 永続的な補正値（計算結果移動量）に累積加算
    set移動量(prev => ({ 
        x: (Number(prev.x) || 0) + dx,
        y: (Number(prev.y) || 0) + dy
    }));
  }

  const isSaveEnabled = 
    !!lohdimLes入力フォルダ &&
    緯度 !== '' && !isNaN(parseFloat(緯度)) &&
    経度 !== '' && !isNaN(parseFloat(経度));

  const isCorrectionSaveEnabled = 
    !!lohdimLes入力フォルダ &&
    !isNaN(移動量.x) &&
    !isNaN(移動量.y);

  // 確認ダイアログを開く関数
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // 確認ダイアログを閉じる関数
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 保存処理を実行する関数
  const handleSave = async () => {
    handleCloseDialog(); // ダイアログを閉じる

    // ファイルに書き込む内容を準備
    const contentToSave = `(Latitude,Longitude)\n${緯度},${経度}\n`;
    const filePath = `${lohdimLes入力フォルダ}/SourceLocation.txt`;

    try {
      // メインプロセスに上書き保存を依頼
      await window.electronAPI.writeFile(filePath, contentToSave);
    } catch (error) {
      console.error('ファイルの保存に失敗しました:', error);
    }
  };

  const handleOpenCorrectionDialog = () => {
    setOpenCorrectionDialog(true);
  };

  const handleCloseCorrectionDialog = () => {
    setOpenCorrectionDialog(false);
  };

  const handleSaveCorrection = async () => {
    handleCloseCorrectionDialog(); // ダイアログを閉じる

    // ファイルに書き込む内容を準備 (X,Yのシンプルなカンマ区切り)
    //const contentToSave = `${移動量.x},${移動量.y}`;
    const filePath = `${lohdimLes入力フォルダ}/MapCorrection.txt`;

    const header = "(X, Y)";
    const dataLine = `${移動量.x},${移動量.y}`;
    const contentToSave = `${header}\n${dataLine}\n`;

    try {
      // メインプロセスに上書き保存を依頼
      await window.electronAPI.writeFile(filePath, contentToSave);
    } catch (error) {
      console.error('移動量ファイルの保存に失敗しました:', error);
    }
  };

  useEffect(() => {
    if (lohdimLes入力フォルダ) {
      const filePath = `${lohdimLes入力フォルダ}/MapCorrection.txt`; // 新しいファイル名
      
      const loadCorrectionFile = async () => {
        try {
          // メインプロセスにAPIを呼び出し、ファイルがあれば読む
          const content = await window.electronAPI.readFile(filePath);
          if (typeof content === 'string' && content.trim() !== '') {
            const lines = content.trim().split('\n');

            if (lines.length > 1) {
                const dataLine = lines[1];

                const [xStr, yStr] = dataLine.trim().split(',');
                const x = parseFloat(xStr);
                const y = parseFloat(yStr);
                
                if (!isNaN(x) && !isNaN(y)) {
                  const correction = {x, y}
                  // アトムを更新
                  set移動量(correction);
                  set建物オフセット(correction);
                } else {
                   // パースエラーの場合は初期値にリセット、またはエラーログ
                   set移動量({x: 0, y: 0});
                   set建物オフセット({ x: 0, y: 0 });
                }
            }
          } else {
            // ファイルが存在しない場合は初期値(0,0)にする。ファイルは作成しない。
            set移動量({ x: 0, y: 0 });
            set建物オフセット({ x: 0, y: 0 });
          }
        } catch (error) {
          // エラーが発生した場合も、GUIの状態を初期値にリセット
          set移動量({x: 0, y: 0})
          set建物オフセット({ x: 0, y: 0 });
        }
      };
      loadCorrectionFile();
    } 
  }, [lohdimLes入力フォルダ, set移動量, set建物オフセット]); 


  useEffect(() => {
    if (lohdimLes入力フォルダ) {
      const filePath = `${lohdimLes入力フォルダ}/SourceLocation.txt`;
      const loadFile = async () => {
        try {
          // メインプロセスを経由してファイルを読み込む
          const content = await window.electronAPI.readFile(filePath);
          if (typeof content === 'string' && content.trim() !== '') {
            setFileContent(content);

            // ファイルの内容から緯度と経度をパース
            const lines = content.trim().split('\n');
            if (lines.length > 1) {
              const dataLine = lines[1]; // 2行目のデータ
              const [lat, lon] = dataLine.split(',').map(s => parseFloat(s.trim()));
              
              if (!isNaN(lat) && !isNaN(lon)) {
                // set放出点経緯度ラベルを使って状態を更新
                set放出点経緯度ラベル({ 緯度: lat.toString(), 経度: lon.toString() });
              }
            }
          }
        } catch (error) {
          setFileContent(null);
        }
      };
      loadFile();
    }
  }, [lohdimLes入力フォルダ, set放出点経緯度ラベル]);

  if (!open) return null

  return (
   <>
    <Stack
      direction="column"
      spacing={2}
      sx={{ px: 1.5, boxSizing: 'border-box', width: 190, marginTop: 'auto !important' }}
    >

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1 }}>
        <Button
          onClick={() => i18n.changeLanguage('ja')}
          sx={{ 
            color: i18n.language === 'ja' ? 'primary.main' : 'gray',
            fontSize: '1rem'
          }}
        >
          {t("language_jp")}
        </Button>
        <Button
          onClick={() => i18n.changeLanguage('en')}
          sx={{ 
            color: i18n.language === 'en' ? 'primary.main' : 'gray',
            fontSize: '1rem'
          }}
        >
          {t("language_en")}
        </Button>
      </Stack>

      <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontWeight: 'bold'}}>
           {t("map_correction")} 
      </Typography>
      {/* 以下のGridコンポーネントを位置調整ボタンとして配置 */}
      <Grid container spacing={1} sx={{ width: 'fit-content', justifyContent: 'center', mx: 'auto' }}>
        
        <Grid item xs={4}></Grid>
        <Grid item xs={4}>
            <Button variant="outlined" size="small" onClick={() => handleMove(0, moveAmount)}>
                <ArrowUpwardIcon />
            </Button>
        </Grid>
        <Grid item xs={4}></Grid>

        <Grid item xs={4}>
            <Button variant="outlined" size="small" onClick={() => handleMove(-moveAmount, 0)}>
                <ArrowBackIcon />
            </Button>
        </Grid>
        <Grid item xs={4}>
            <Box sx={{ width: 24, height: 24 }} />
        </Grid>
        <Grid item xs={4}>
            <Button variant="outlined" size="small" onClick={() => handleMove(moveAmount, 0)}>
                <ArrowForwardIcon />
            </Button>
        </Grid>

        <Grid item xs={4}></Grid>
        <Grid item xs={4}>
            <Button variant="outlined" size="small" onClick={() => handleMove(0, -moveAmount)}>
                <ArrowDownwardIcon />
            </Button>
        </Grid>
        <Grid item xs={4}></Grid>
      </Grid>

      <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: 'gray', ml:0, textAlign: 'left' }}>{t("calculation_result_offset_label")}</Typography>
          </Grid>
          <Grid item xs={6}>
              <TextFieldUnit
                label="X"
                unit="m"
                value={String(移動量.x)}
                onChange={(val) => {
                        set移動量(prev => ({ ...prev, x: val as any })); 
                        const numX = parseFloat(val);
                        if (!isNaN(numX)) {
                          set建物オフセット(prev => ({ ...prev, x: numX }));
                        }
                    }
                }
              />
          </Grid>
          <Grid item xs={6}>
              <TextFieldUnit
                label="Y"
                unit="m"
                value={String(移動量.y)}
                onChange={(val) => {
                        set移動量(prev => ({ ...prev, y: val as any })); 
                        const numY = parseFloat(val);
                        if (!isNaN(numY)) {
                          set建物オフセット(prev => ({ ...prev, y: numY }));
                        }
                    }
                }
              />
          </Grid>
      </Grid>
      
      
      {/* その他のボタンやコンポーネント */}
      <Button 
        variant="outlined" 
        size="small"
        onClick={handleOpenCorrectionDialog}
        disabled={!isCorrectionSaveEnabled}
      >
        {t("save")}
      </Button>


      {/* 放出点緯度 */}
      <TextFieldUnit
        label={t("release_point_latitude_label")}
        unit={t("degree_unit")}
        value={緯度}
        error={error緯度}
        onChange={(緯度) => set放出点経緯度ラベル({ 緯度, 経度 })}
      />

      {/* 放出点経度 */}
      <TextFieldUnit
        label={t("release_point_longitude_label")}
        unit={t("degree_unit")}
        value={経度}
        error={error経度}
        onChange={(経度) => set放出点経緯度ラベル({ 緯度, 経度 })}
      />

      <Button 
            variant="outlined" 
            size="small"
            onClick={handleOpenDialog}
            disabled={!isSaveEnabled}
      >
        {t("save")}
      </Button>

      {/* 放出点高さ */}
      <Label放出点高さ value={高さ} />

      {/* セル番号 */}
      <放出点セル
        x={x}
        y={y}
        z={z}
        errorX={errorX}
        errorY={errorY}
        errorZ={errorZ}
        disabled={disableSet放出点セル}
        set放出点セルラベル={set放出点セルラベル}
      />

      {/* 地図画像 */}
      <地図画像 画像={画像} set画像={set画像} />
    </Stack>

    <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>{t("dialog_title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("dialog_content_text")} 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
    </Dialog>

    <Dialog
        open={openCorrectionDialog}
        onClose={handleCloseCorrectionDialog}
      >
        <DialogTitle>{t("dialog_title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("offset_dialog_content_text")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCorrectionDialog} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={handleSaveCorrection} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
    </Dialog>
   </>
  )
}

function 放出点セル({
  x,
  y,
  z,
  errorX,
  errorY,
  errorZ,
  disabled,
  set放出点セルラベル
}: {
  x: string
  y: string
  z: string
  errorX: boolean
  errorY: boolean
  errorZ: boolean
  disabled: boolean
  set放出点セルラベル: (xyz: Type放出点セルラベル) => void
}) {
  const {t} = useTranslation()
  return (
    <>
      <Typography variant="caption" sx={{ color: 'gray' }}>
        {t("release_point_cell_label")}      
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: '0 !important' }}>
        <TextField
          value={x}
          error={errorX}
          disabled={disabled}
          slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
          onChange={(e) => set放出点セルラベル({ x: e.target.value, y, z })}
        />
        <TextField
          value={y}
          error={errorY}
          disabled={disabled}
          slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
          onChange={(e) => set放出点セルラベル({ x, y: e.target.value, z })}
        />
        <TextField
          value={z}
          error={errorZ}
          disabled={disabled}
          slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
          onChange={(e) => set放出点セルラベル({ x, y, z: e.target.value })}
        />
      </Stack>
    </>
  )
}

function Label放出点高さ({ value }: { value?: number }) {
  const {t} = useTranslation();
  return (
    <Stack direction="row" alignItems="baseline">
      <Typography variant="caption" sx={{ color: 'gray', mr: 'auto' }}>
        {t("release_point_height_label")}
      </Typography>
      {value === undefined ? '--' : value.toFixed(2)}
      <Typography variant="body2" component="div" marginLeft={1}>
        m
      </Typography>
    </Stack>
  )
}

function TextFieldUnit({
  label,
  unit,
  value,
  error,
  disabled,
  onChange
}: {
  label: string
  unit: string
  value: string
  error?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
      <TextField
        label={label}
        value={value}
        error={error}
        disabled={disabled}
        slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <Typography variant="body2" component="div">
        {unit}
      </Typography>
    </Stack>
  )
}

function 地図画像({ 画像, set画像 }: { 画像: Type画像; set画像: (画像: Type画像) => void }) {
  const {t} = useTranslation();

  return (
    <FormControl variant="filled" fullWidth>
      <InputLabel>{t("map_image_label")}</InputLabel>
      <Select
        value={画像}
        label={t("map_image_label")}
        onChange={(event) => set画像(event.target.value as typeof 画像)}
      >
        <MenuItem value={'地理院地図'}>{t("gsi_map_label")}</MenuItem>
        <MenuItem value={'OpenStreetMap'}>OpenStreetMap</MenuItem>
      </Select>
    </FormControl>
  )
}
