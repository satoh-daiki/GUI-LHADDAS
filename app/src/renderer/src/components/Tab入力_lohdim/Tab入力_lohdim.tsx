import
  React, {
  useState,
  useCallback,
  useEffect
} from 'react';
import {
  Stack,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Grid,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { useAtom, useSetAtom } from 'jotai';
import { Message } from './Message';
import { useTab計算 } from '@renderer/hooks/components/Tab計算/useTab計算'
import { formDataAtom, FormData, ValidationErrors } from '../../hooks/atoms/atoms入力_lohdim.ts';
import { TextFieldSelectPath } from './../TextFieldSelectPath';
import { TextFieldSelectFile } from './../TextFieldSelectFile';
import { TextFieldSelectFileQuoted } from './../TextFieldSelectFileQuoted';
import { formatLohdimLesData } from '../common/formatLohdimLesData';
import { validateLohdimLes } from '../../utils/validation/validation'
import PopupNotification from '../PopupNotification'
import OutputFileModal from '../OutputFileModal'
import { validationErrorsAtom } from '../../hooks/atoms/atoms入力_lohdim.ts';
import { lohdimLesFileContentAtom } from '../../hooks/atoms/atomsInputFileContent'
import { parseIniFormat } from '../../components/common/parseIniFormat';
import { convertToLohdimFormat } from '../../components/common/convertToLohdimFormat';
import { convertToOriginalFormat } from '../../components/common/convertToOriginalFormat';
import { mapLohdimDataToFormData } from '../../components/common/lohdimMapper';
import { atomMap設定_放出点セル, atomMap設定_放出点セルラベル } from '../../hooks/atoms/atomsMap設定';
import { atom計算_LohdimLes入力フォルダ } from '../../hooks/atoms/atoms計算タブ';
import { atomInputRefreshTrigger } from '../../hooks/atoms/deriv計算_入力';
import { atomMapエラー通知 } from '@renderer/hooks/atoms/atomsMap設定';

// 翻訳キーの型アサーション
type T = (key: string) => string;

const isValidUnsignedInteger = (value: string): boolean => {
  return /^\d*$/.test(value);
};

const isValidReal = (value: string): boolean => {
  return /^-?\d*\.?\d*$/.test(value);
};

/**
 * 汎用のTextFieldコンポーネント（サイズ小、幅フル）
 */
const DefaultTextField = (props: any) => (
  <TextField size="small" fullWidth {...props} />
);

// EmissionPointInput, CellCountInput, OnOffTextSectionで共有されるProps
interface InputComponentProps {
    formData: FormData;
    validationErrors: ValidationErrors;
    handleCoordXChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCoordYChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCoordZChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCellsEastWestChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCellsNorthSouthChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCellsVerticalChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleBldgTerrainCalcChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDispersionCalcChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDryDepositionCalcChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDryDepoVelocityChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleFrictionVelocityChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleRoughnessLengthChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTurbulenceGenerationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleContinueCalcChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSibylModelChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleBuildingDataChange: (value: string) => void;
    handleTerrainDataChange: (value: string) => void;
    t: T;
}


/**
 * 座標入力用のコンポーネント (放出点座標)
 */
const EmissionPointInput = ({ formData, validationErrors, handleCoordXChange, handleCoordYChange, handleCoordZChange }: InputComponentProps) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3.5}>
        <Typography variant="body2" sx={{ mt: 1 }}>X</Typography>
      </Grid>
      <Grid item xs={8.5}>
        <DefaultTextField
          value={formData.emissionPointCoord.coordX}
          onChange={handleCoordXChange}
          inputProps={{ style: { textAlign: 'right' } }}
          error={!!validationErrors['emissionPointCoord.coordX']}
          helperText={validationErrors['emissionPointCoord.coordX']}
        />
      </Grid>
      <Grid item xs={3.5}>
        <Typography variant="body2" sx={{ mt: 1 }}>Y</Typography>
      </Grid>
      <Grid item xs={8.5}>
        <DefaultTextField
          value={formData.emissionPointCoord.coordY}
          onChange={handleCoordYChange}
          inputProps={{ style: { textAlign: 'right' } }}
          error={!!validationErrors['emissionPointCoord.coordY']}
          helperText={validationErrors['emissionPointCoord.coordY']}
        />
      </Grid>
      <Grid item xs={3.5}>
        <Typography variant="body2" sx={{ mt: 1 }}>Z</Typography>
      </Grid>
      <Grid item xs={8.5}>
        <DefaultTextField
          value={formData.emissionPointCoord.coordZ}
          onChange={handleCoordZChange}
          inputProps={{ style: { textAlign: 'right' } }}
          error={!!validationErrors['emissionPointCoord.coordZ']}
          helperText={validationErrors['emissionPointCoord.coordZ']}
        />
      </Grid>
    </Grid>
  );
};

/**
 * セル数入力用のコンポーネント
 */
const CellCountInput = ({ formData, validationErrors, handleCellsEastWestChange, handleCellsNorthSouthChange, handleCellsVerticalChange, t }: InputComponentProps) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3.5}>
        <Typography variant="body2" sx={{ mt: 1 }}>{t("cells_east_west")}</Typography>
      </Grid>
      <Grid item xs={8.5}>
        <DefaultTextField
          value={formData.cellCount.cellsEastWest}
          onChange={handleCellsEastWestChange}
          inputProps={{ style: { textAlign: 'right' } }}
          error={!!validationErrors['cellCount.cellsEastWest']}
          helperText={validationErrors['cellCount.cellsEastWest']}
        />
      </Grid>
      <Grid item xs={3.5}>
        <Typography variant="body2" sx={{ mt: 1 }}>{t("cells_north_south")}</Typography>
      </Grid>
      <Grid item xs={8.5}>
        <DefaultTextField
          value={formData.cellCount.cellsNorthSouth}
          onChange={handleCellsNorthSouthChange}
          inputProps={{ style: { textAlign: 'right' } }}
          error={!!validationErrors['cellCount.cellsNorthSouth']}
          helperText={validationErrors['cellCount.cellsNorthSouth']}
        />
      </Grid>
      <Grid item xs={3.5}>
        <Typography variant="body2" sx={{ mt: 1 }}>{t("cells_vertical")}</Typography>
      </Grid>
      <Grid item xs={8.5}>
        <DefaultTextField
          value={formData.cellCount.cellsVertical}
          onChange={handleCellsVerticalChange}
          inputProps={{ style: { textAlign: 'right' } }}
          error={!!validationErrors['cellCount.cellsVertical']}
          helperText={validationErrors['cellCount.cellsVertical']}
        />
      </Grid>
    </Grid>
  );
};

/**
 * ON/OFF選択とテキスト/パスフィールドを組み合わせたセクション（任意項目）
 */
const OnOffTextSection = ({
    formData,
    handleBldgTerrainCalcChange,
    handleDispersionCalcChange,
    handleDryDepositionCalcChange,
    handleDryDepoVelocityChange,
    handleFrictionVelocityChange,
    handleRoughnessLengthChange,
    handleTurbulenceGenerationChange,
    handleContinueCalcChange,
    handleSibylModelChange,
    handleBuildingDataChange,
    handleTerrainDataChange,
    t
}: InputComponentProps) => (
  <Stack spacing={3} sx={{ paddingX: 4 }}>
    {/* 建物・地形計算 (9) */}
    {/* 
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("bldg_terrain_calc_on")}</Typography>
      <RadioGroup row value={formData.bldgTerrainCalc} onChange={handleBldgTerrainCalcChange} sx={{ ml: 2 }}>
        <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
        <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
      </RadioGroup>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("building_data")}</Typography>
      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <TextFieldSelectFile
          value={formData.buildingData}
          onChangeText={handleBuildingDataChange}
          type={'file'}
          stackSx={{ flexGrow: 1 }}
        />
      </Box>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("terrain_data")}</Typography>
      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <TextFieldSelectFile
          value={formData.terrainData}
          onChangeText={handleTerrainDataChange}
          type={'file'}
          stackSx={{ flexGrow: 1 }}
        />
      </Box>
    </Box>

    <Divider sx={{ my: 3 }} />
    */}

    {/* 大気拡散計算 (10) */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("dispersion_calc")}</Typography>
      <RadioGroup row value={formData.dispersionCalc} onChange={handleDispersionCalcChange} sx={{ ml: 2 }}>
        <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
        <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
      </RadioGroup>
    </Box>

    {/* 乾性沈着計算 (11) */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("dry_deposition_calc")}</Typography>
      <RadioGroup row value={formData.dryDepositionCalc} onChange={handleDryDepositionCalcChange} sx={{ ml: 2 }}>
        <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
        <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
      </RadioGroup>
    </Box>

    <Grid container alignItems="center">
      {/* 乾性沈着速度 (25) */}
      <Grid item xs={6} sx={{ paddingRight: 6}}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ flexShrink: 0 }}>{t("dry_depo_velocity")}</Typography>
          <DefaultTextField
            sx={{ ml: 1, flexGrow: 1 }}
            value={formData.dryDepoVelocity}
            onChange={handleDryDepoVelocityChange}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Box>
      </Grid>
      {/* 摩擦速度 (22) */}
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ flexShrink: 0 }}>{t("friction_velocity")}</Typography>
          <DefaultTextField
            sx={{ ml: 1, flexGrow: 1 }}
            value={formData.frictionVelocity}
            onChange={handleFrictionVelocityChange}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Box>
      </Grid>
      {/* 粗度長 (23) */}
      <Grid item xs={6} sx={{ paddingRight: 6, pt: 3}}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ flexShrink: 0 }}>{t("roughness_length")}</Typography>
          <DefaultTextField
            sx={{ ml: 1, flexGrow: 1 }}
            value={formData.roughnessLength}
            onChange={handleRoughnessLengthChange}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Box>
      </Grid>
    </Grid>

    <Divider sx={{ my: 3 }} />

    {/* 乱流生成 (12) */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("turbulence_generation")}</Typography>
      <RadioGroup row value={formData.turbulenceGeneration} onChange={handleTurbulenceGenerationChange} sx={{ ml: 2 }}>
        <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
        <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
      </RadioGroup>
    </Box>

    {/* 継続計算 (14) */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("continue_calc")}</Typography>
      <RadioGroup row value={formData.continueCalc} onChange={handleContinueCalcChange} sx={{ ml: 2 }}>
        <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
        <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
      </RadioGroup>
    </Box>

    {/* SIBYL (8) */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("sibyl_model")}</Typography>
      <RadioGroup row value={formData.sibylModel} onChange={handleSibylModelChange} sx={{ ml: 2 }}>
        <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
        <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
      </RadioGroup>
    </Box>

  </Stack>
);


/**
 * 入力タブのコンポーネント
 */
export function Tab入力_lohdim(): JSX.Element {
  const { t } = useTranslation() as { t: T };
  const [formData, setFormData] = useAtom(formDataAtom);
  const [isDirty, setIsDirty] = useState(false);
  const [isinputdata, setIsinputdata] = useState(false);
  const [isExportedSuccessfully, setIsExportedSuccessfully] = useState(false);
  const setFileContent = useSetAtom(lohdimLesFileContentAtom);
  const [openDialog, setOpenDialog] = useState(false);
  const { lohdimLes入力フォルダ } = useTab計算()
  const setLohdimPath = useSetAtom(atom計算_LohdimLes入力フォルダ);

  const setMap放出点セル = useSetAtom(atomMap設定_放出点セル); // 地図上の赤い点のため
  const setMap放出点セルラベル = useSetAtom(atomMap設定_放出点セルラベル); // Map設定の入力欄のため

  const [mapError, setMapError] = useAtom(atomMapエラー通知);

  useEffect(() => {
    if (mapError) {
      setPopup({
        isVisible: true,
        message: mapError.message,
        type: mapError.type
      });
      // 通知したら Atom をリセットする
      setMapError(undefined);
    }
  }, [mapError, setMapError]);

  //再読み込み用
  const setInputRefresh = useSetAtom(atomInputRefreshTrigger);
  const handleReload = useCallback(async () => {
      if (!lohdimLes入力フォルダ) return;
      const fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'LOHDIM-LES_input.data');
  
      try {
          const data = await window.electronAPI.readFile(fullPath);
          if (typeof data !== 'string') {
            throw new Error('LOHDIM-LES_input.data の読み込みに失敗しました（文字列ではありません）。');
          }
          const inputformdata = convertToLohdimFormat(data);
          const rawData = parseIniFormat(inputformdata);
          const nextFormData = mapLohdimDataToFormData(rawData);
  
          const nx = Number(nextFormData.emissionPointCoord.coordX);
          const ny = Number(nextFormData.emissionPointCoord.coordY);
          const nz = Number(nextFormData.emissionPointCoord.coordZ);
  
          if (isNaN(nx) || isNaN(ny) || isNaN(nz)) {
              throw new Error("LOHDIMデータの放出点座標が不正です。");
          }
  
          setFormData(nextFormData);

          setInputRefresh(prev => prev + 1);

          // 座標系の同期
          setTimeout(() => {
               setMap放出点セル({ x: nx, y: ny, z: nz });
               setMap放出点セルラベル({ x: String(nx), y: String(ny), z: String(nz) });
           }, 200);
  
          //setPopup({ isVisible: true, message: '再読み込みが完了しました', type: 'success' });
          setPopup({ isVisible: true, message: `${t("reload_success")}`, type: 'success' });
          setIsDirty(false);
  
      } catch (error: any) {
          setPopup({ isVisible: true, message: error.message, type: 'error' });
      }
  }, [lohdimLes入力フォルダ, setFormData, setMap放出点セル, setMap放出点セルラベル, setLohdimPath]);

    // 保存処理を共通化
    const saveTotemp = useCallback(async (currentData: FormData) => {
        if (!lohdimLes入力フォルダ) return;
        const formateddata = formatLohdimLesData(currentData);
        const rawData = parseIniFormat(formateddata);
        const originalText = convertToOriginalFormat(rawData);
        
        const fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'tempLOHDIM-LES_input.data');
        try {
            await window.electronAPI.writeFile(fullPath, originalText);
        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    }, [lohdimLes入力フォルダ]);


    useEffect(() => {
      if (lohdimLes入力フォルダ) {
          const fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'LOHDIM-LES_input.data')
          
          window.electronAPI.readFile(fullPath)
              .then(async data => {
                    if (typeof data !== 'string') {
                      throw new Error('LOHDIM-LES_input.data の読み込みに失敗しました（文字列ではありません）。');
                    }
                  setIsinputdata(true)
                 //convert to GUI form data
                  const inputformdata = convertToLohdimFormat(data)
                  
                  const rawData = parseIniFormat(inputformdata);

                  const formData = mapLohdimDataToFormData(rawData);
                  setFormData(formData);

                  setIsDirty(false);

                  await saveTotemp(formData);

                  //to make original temporary data to use temp view
                  const temporarytext = convertToOriginalFormat(rawData)
                  const tempdata_fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'tempLOHDIM-LES_input.data')
                  window.electronAPI.writeFile(tempdata_fullPath,temporarytext)
                  ////もし元のinputファイルに欠落があった場合、temporarytextの中にはデフォルト値を格納したものが保存されているのでそれを現在のinputにも反映
                  //const inputdata_fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'LOHDIM-LES_input.data')
                  //window.electronAPI.writeFile(inputdata_fullPath,temporarytext)
              })
              .catch(error => {
                  //to load default file
                    const fullPath = window.electronAPI.join(window.paths.templateDir, 'LOHDIM-LES_input_template.data')
                    setIsinputdata(false)
                    window.electronAPI.readFile(fullPath)
                    .then(data => {
                      if (typeof data !== 'string') {
                        throw new Error('LOHDIM-LES_input_template.data の読み込みに失敗しました（文字列ではありません）。');
                      }
                           
                           //convert to GUI form data
                            const inputformdata = convertToLohdimFormat(data)
                            
                            const rawData = parseIniFormat(inputformdata);

                            const formData = mapLohdimDataToFormData(rawData);
                            setFormData(formData);

                            //to make original temporary data to use temp view
                            const temporarytext = convertToOriginalFormat(rawData)
                            const tempdata_fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'tempLOHDIM-LES_input.data')
                        })
                        .catch(error => {
                            setFileContent({});
                        });
           });
      }
    //add 20251218
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // 変更があり、かつエクスポートされていない場合のみ警告
        if (isDirty && !isExportedSuccessfully) {
            e.preventDefault();
            e.returnValue = ''; // ブラウザ標準のダイアログを表示
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);

  }, [lohdimLes入力フォルダ, saveTotemp]); 

  const [expandedRequired, setExpandedRequired] = useState<boolean>(true);
  const [expandedOptional, setExpandedOptional] = useState<boolean>(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: '',
    type: 'success',
  });

  //add 20251210
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  
  const handleClosePopup = () => {
    setPopup(prev => ({...prev, isVisible: false}))
  }


  const handleRequiredAccordionChange = useCallback(() => {
    setExpandedRequired(prev => !prev);
  }, []);
  const handleOptionalAccordionChange = useCallback(() => {
    setExpandedOptional(prev => !prev);
  }, []);
  
  // 確認ダイアログを開く関数
  const handleOpenDialog = () => {
    if(isinputdata){
        //input dataが存在していた場合にはダイアログで確認
        setOpenDialog(true);
    }
    else{
        //なければそのまま保存
        handleExport()
    }
  };

  // 確認ダイアログを閉じる関数
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 入力欄のバリデーション用atom
  const [validationErrors, setValidationErrors] = useAtom(validationErrorsAtom);

  const handleExport = useCallback(async () => {
        
        //ダイアログが出ていたら閉じる
        handleCloseDialog();
    
        // バリデーション実行
        const errors = validateLohdimLes(formData);
        setValidationErrors(errors);
	//const errorMessages = Object.values(errors).map(msg => t(msg)).join('\n');
	// 重複を排除してメッセージを作成する例
	const uniqueMessages = Array.from(new Set(Object.values(errors)));
	const errorMessages = uniqueMessages.map(msg => t(msg)).join('\n');
    
    
        // エラーがあれば書き出し処理を中断し、ポップアップを表示
        if (Object.keys(errors).length > 0) {
            Object.values(errors).map((msg) =>{
                setPopup({
                    isVisible: true,
                    // message: `未入力または不正な値があります: ${msg}`,
                    message: `${errorMessages}`, // 翻訳キーを使用
                    type: 'error'
                });
            })
            return;
        }
    
        
         //to formated string
         const formatedstr = formatLohdimLesData(formData);
         //to object
         const objData = parseIniFormat(formatedstr);
         //to original string
         const originaltext = convertToOriginalFormat(objData);

        //await window.electronAPI.writeInputFile(lohdimLes入力フォルダ, 'LOHDIM-LES_input.data', originaltext);
        const fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'LOHDIM-LES_input.data');
        try {
            await window.electronAPI.writeFile(fullPath, originaltext);
            setIsExportedSuccessfully(true);
            setIsinputdata(true);
            setIsDirty(false)
            setPopup({
                isVisible: true,
                //message: 'LOHDIM-LES入力ファイルの書き込みに成功しました',
                message: `${t("lohdimexport_success")}`,
                type: 'success'
            });
        } catch (err) {
            setIsExportedSuccessfully(false); // 失敗時は念のためfalseに戻す
            setPopup({
                isVisible: true,
                //message: `LOHDIM-LES入力ファイルの書き込みに失敗しました: ${error.message || '不明なエラー'}`,
                message: `${t("lohdimexport_failure")} ${error.message || '不明なエラー'}`,
                type: 'error'
            });
            return;
        }
}, [formData, lohdimLes入力フォルダ, setValidationErrors, setPopup,setIsExportedSuccessfully,setIsDirty,isinputdata]);


  const handleShowContent = useCallback(async () => {
      // フォルダが指定されていない場合のチェック
      if (!lohdimLes入力フォルダ) {
          setPopup({
              isVisible: true,
              //message: '入力フォルダが指定されていません。',
              message: `${t("lohdim_inputfolder_unknown")}`,
              type: 'error'
          });
          return;
      }
  
      try {
          await saveTotemp(formData);

          const fullPath = window.electronAPI.join(lohdimLes入力フォルダ, 'tempLOHDIM-LES_input.data');
          
          const data = await window.electronAPI.readFile(fullPath); 
          
          // モーダルに内容を設定して開く
          setModalContent(data);
          setIsModalOpen(true);
  
      } catch (error: any) {
          setPopup({
              isVisible: true,
              //message: `出力ファイルの内容の読み込みに失敗しました: ${error.message || 'ファイルが存在しないか、読み取りエラーです。'}`,
              message: `${t("lohdim_tempfile_failure")} ${error.message || 'ファイルが存在しないか、読み取りエラーです。'}`,
              type: 'error'
          });
      }
  }, [lohdimLes入力フォルダ, setPopup, setIsModalOpen, setModalContent, formData, saveTotemp]); // 依存配列

  // ===========================================
  // ヘルパー関数群 (Jotai Atomの更新ロジック)
  // ===========================================



  useEffect(() => {
    if (!lohdimLes入力フォルダ || !formData) return;
  
    const timer = setTimeout(() => {
      saveTotemp(formData);
    }, 200);
  
    return () => clearTimeout(timer); // 次の入力が来たらキャンセルする
  }, [formData, lohdimLes入力フォルダ, saveTotemp]);


  // トップレベルのフィールドを更新するヘルパー

  const updateField = useCallback((field: keyof FormData, value: string) => {
      setFormData(prev => { 
        const next = {...prev, [field]: value }
        //TODO: saveTotemp(next)
        
        const errors = validateLohdimLes(next)

    	const errorMessages = Object.values(errors).map(msg => t(msg)).join('\n');

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).map((msg) =>{
                setPopup({
                    isVisible: true,
                    // message: `未入力または不正な値があります: ${msg}`,
                    message: `${errorMessages}`, // 翻訳キーを使用
                    type: 'error'
                });
            })
        }
        else{
                setPopup(prev => ({
                    ...prev,
                    isVisible: false,
                    message:``,
                }));
        }
        return next
      });
      setIsDirty(true)
  }, [setFormData,setValidationErrors]);

  // ネストされたフィールドを更新するヘルパー

  const updateNestedField = useCallback(<T extends keyof FormData>(
    section: T,
    field: keyof FormData[T],
    value: string
  ) => {
      setFormData(prev => {
         const next = {
          ...prev,
          [section]: {
              ...(prev[section] as object),
              [field]: value
          } as any
      }
        //TODO: saveTotemp(next)
        const errors = validateLohdimLes(next)
    	    const errorMessages = Object.values(errors).map(msg => t(msg)).join('\n');
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).map((msg) =>{
                setPopup({
                    isVisible: true,
                    //message: `未入力または不正な値があります: ${msg}`,
                    message: `${errorMessages}`, // 翻訳キーを使用
                    type: 'error'
                });
            })
        }
        else{
                setPopup(prev => ({
                    ...prev,
                    isVisible: false,
                    message:``,
                }));
        }
        return next
    });
     setIsDirty(true)
  }, [setFormData,setValidationErrors]);

  // ===========================================
  // イベントハンドラ
  // ===========================================

  // 13. 放出点座標
  const handleCoordXChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateNestedField('emissionPointCoord', 'coordX', val);
    }
  };
  const handleCoordYChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateNestedField('emissionPointCoord', 'coordY', val);
    }
  };
  const handleCoordZChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateNestedField('emissionPointCoord', 'coordZ', val);
    }
  };

  // 24. 平均風向 (度)
  const handleAverageWindDirectionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {	
	    updateField('averageWindDirection', val);
    }
  };

  // 4. 放出率データ
  const handleEmissionRateDataChange = (value: string) => {
    updateField('emissionRateData', value);
  };

  // 21. 水平分解能 (m)
  const handleHorizontalResolutionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {
	    updateField('horizontalResolution', val);
    }
  };

  // 5, 6, 7. セル数
  const handleCellsEastWestChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateNestedField('cellCount', 'cellsEastWest', val);
    }
  };
  const handleCellsNorthSouthChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateNestedField('cellCount', 'cellsNorthSouth', val);
    }
  };
  const handleCellsVerticalChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateNestedField('cellCount', 'cellsVertical', val);
    }
  };

  // 3. 鉛直メッシュデータ
  const handleVerticalMeshDataChange = (value: string) => {
    updateField('verticalMeshData', value);
  };

  // 1, 2. 建物・地形データ
  const handleBuildingDataChange = (value: string) => {
    updateField('buildingData', value);
  };
  const handleTerrainDataChange = (value: string) => {
    updateField('terrainData', value);
  };

  const handleCalcStartChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateField('calcStart', val);
    }
  };
  const handleOutputStartChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateField('outputStart', val);
    }
  };
  const handleDispersionStartChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateField('dispersionStart', val);
    }
  };
  const handleCalcEndChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidUnsignedInteger(val)) {
	    updateField('calcEnd', val);
    }
  };
  const handleOutputIntervalChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {
	    updateField('outputInterval', val);
    }
  };
  const handleStepIntervalChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {
	    updateField('stepInterval', val);
    }
  };
  const handleBldgTerrainCalcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('bldgTerrainCalc', event.target.value);
  };
  const handleDispersionCalcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('dispersionCalc', event.target.value);
  };
  const handleDryDepositionCalcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('dryDepositionCalc', event.target.value);
  };
  const handleDryDepoVelocityChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {
	    updateField('dryDepoVelocity', val);
    }
  };
  const handleFrictionVelocityChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {
	    updateField('frictionVelocity', val);
    }
  };
  const handleRoughnessLengthChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (isValidReal(val)) {
	    updateField('roughnessLength', val);
    }
  };
  const handleTurbulenceGenerationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('turbulenceGeneration', event.target.value);
  };
  const handleContinueCalcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('continueCalc', event.target.value);
  };
  const handleSibylModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('sibylModel', event.target.value);
  };

  // 外側コンポーネントに渡すpropsをまとめる
  const commonProps: InputComponentProps = {
    formData,
    validationErrors,
    handleCoordXChange,
    handleCoordYChange,
    handleCoordZChange,
    handleCellsEastWestChange,
    handleCellsNorthSouthChange,
    handleCellsVerticalChange,
    handleBldgTerrainCalcChange,
    handleDispersionCalcChange,
    handleDryDepositionCalcChange,
    handleDryDepoVelocityChange,
    handleFrictionVelocityChange,
    handleRoughnessLengthChange,
    handleTurbulenceGenerationChange,
    handleContinueCalcChange,
    handleSibylModelChange,
    handleBuildingDataChange,
    handleTerrainDataChange,
    t
  };


  return (
      <Box sx={{ position: 'relative', pb: 8 }}>
        <Stack spacing={4} sx={{ pt: 3, pb: 2, px: 2, maxWidth: 1000, mx: 'auto' }}>

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
                paddingRight: 3,
            }}
        >
            <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={handleShowContent}
                sx={{zIndex: 1,marginRight: 2}}
            >
                {t("show_content")}
            </Button>
            <Button
                variant="contained"
                color="primary"
                size="large"
//                onClick={handleExport}
                onClick={handleOpenDialog}
                sx={{zIndex: 1,marginRight: 2}}
            >
                {t("export")}
            </Button>
            <Button
                variant="outlined"
                color="info"
                size="large"
                onClick={handleReload}
                sx={{ zIndex: 1}}
            >
               {t("reload")} 
            </Button>
        </Box>

          {/*必須項目アコーディオン*/}
          <Accordion
            expanded={expandedRequired}
            onChange={handleRequiredAccordionChange}
            sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="required-content"
              id="required-header"
              sx={{ bgcolor: '#ffebee' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {t("required_fields")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <Stack spacing={0} sx={{ paddingX: 4 }}>

                <Grid container spacing={1}>
                  {/* 13. 放出点座標 */}
                  <Grid item xs={6} sx={{ paddingRight: 6 }}>
                    <Typography variant="subtitle1" sx={{  mb: 1 }}>{t("emission_point_coord")}</Typography>
                    <EmissionPointInput {...commonProps} />
                  </Grid>

                  {/* 4. 放出率データ*/}
                  <Grid item xs={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ minWidth: 200 }}>{t("emission_rate_data")}</Typography>
                      <Box sx={{ ml: 0, mt: 1 }}>
                       {/*  <TextFieldSelectPath */}
                        <TextFieldSelectFileQuoted
                          value={formData.emissionRateData}
                          onChangeText={handleEmissionRateDataChange}
                          type={'file'}
                          stackSx={{ flexGrow: 1 }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>{t("average_wind_direction")}</Typography>
                      <DefaultTextField
                        value={formData.averageWindDirection}
                        onChange={handleAverageWindDirectionChange}
                        inputProps={{ style: { textAlign: 'right' } }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* 21. 水平分解能 & 5, 6, 7. セル数 */}
                <Grid container>
                  <Grid item xs={6} sx={{ paddingRight: 6 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>{t("horizontal_resolution")}</Typography>
                    <DefaultTextField
                      value={formData.horizontalResolution}
                      onChange={handleHorizontalResolutionChange}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>{t("cell_count")}</Typography>
                    <CellCountInput {...commonProps} />
                  </Grid>
                </Grid>

                {/* 3. 鉛直メッシュデータ */}
                <Box>
                  <Typography variant="body1" sx={{ minWidth: 200 }}>{t("vertical_mesh_data")}</Typography>
                  <Box sx={{ ml: 0, mt: 1 }}>
                    {/*<TextFieldSelectPath */}
                    <TextFieldSelectFileQuoted
                      value={formData.verticalMeshData}
                      onChangeText={handleVerticalMeshDataChange}
                      type={'file'}
                      stackSx={{ flexGrow: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 15-18. 時刻設定 & 19, 20. 間隔設定 */}
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>{t("calc_start")}</Typography>
                          <DefaultTextField
                            placeholder=""
                            value={formData.calcStart}
                            onChange={handleCalcStartChange}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>{t("dispersion_start")}</Typography>
                          <DefaultTextField
                            placeholder=""
                            value={formData.dispersionStart}
                            onChange={handleDispersionStartChange}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>{t("calc_end")}</Typography>
                          <DefaultTextField
                            placeholder=""
                            value={formData.calcEnd}
                            onChange={handleCalcEndChange}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={6}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>{t("output_start")}</Typography>
                          <DefaultTextField
                            placeholder=""
                            value={formData.outputStart}
                            onChange={handleOutputStartChange}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>{t("output_interval")}</Typography>
                          <DefaultTextField
                            value={formData.outputInterval}
                            onChange={handleOutputIntervalChange}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>{t("step_interval")}</Typography>
                          <DefaultTextField
                            value={formData.stepInterval}
                            onChange={handleStepIntervalChange}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 3 }} />

                {/* 建物・地形計算 (9) */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ minWidth: 200 }}>{t("bldg_terrain_calc_on")}</Typography>
                  <RadioGroup row value={formData.bldgTerrainCalc} onChange={handleBldgTerrainCalcChange} sx={{ ml: 2 }}>
                    <FormControlLabel value="1" control={<Radio size="small" />} label={t("on")} />
                    <FormControlLabel value="0" control={<Radio size="small" />} label={t("off")} />
                  </RadioGroup>
                </Box>
            
                {/* 建物データ */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ minWidth: 200 }}>{t("building_data")}</Typography>
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                   {/* <TextFieldSelectPath */}
                    <TextFieldSelectFileQuoted
                      value={formData.buildingData}
                      onChangeText={handleBuildingDataChange}
                      type={'file'}
                      stackSx={{ flexGrow: 1 }}
                    />
                  </Box>
                </Box>
            
                {/* 地形データ*/}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ minWidth: 200 }}>{t("terrain_data")}</Typography>
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                   {/*  <TextFieldSelectPath */}
                    <TextFieldSelectFileQuoted
                      value={formData.terrainData}
                      onChangeText={handleTerrainDataChange}
                      type={'file'}
                      stackSx={{ flexGrow: 1 }}
                    />
                  </Box>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>


          {/*任意項目アコーディオン*/}
          <Accordion
            expanded={expandedOptional}
            onChange={handleOptionalAccordionChange}
            sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="optional-content"
              id="optional-header"
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {t("optional_fields")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <OnOffTextSection {...commonProps} />
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
                paddingRight: 3,
            }}
        >
            <OutputFileModal
                        isOpen={isModalOpen}
                        content={modalContent}
                        filename='LOHDIM-LES_input.data'
                        onClose={() => setIsModalOpen(false)}
                        t={t}
            />
        </Box>
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
          >
            <DialogTitle>{t("dialog_title")}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t("dialog_content_text_lohdim")} 
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                {t("cancel")}
              </Button>
              <Button onClick={handleExport} color="primary" autoFocus>
                OK
              </Button>
            </DialogActions>
        </Dialog>
      </Box>

  );
}
