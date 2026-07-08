import { PlayCircleOutline } from '@mui/icons-material'
import { Button, FormControlLabel, Stack, Switch, Typography, LinearProgress, Box } from '@mui/material'
import { TextFieldSelectPath } from './../TextFieldSelectPath'
import { useTab計算 } from '@renderer/hooks/components/Tab計算/useTab計算'
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { formDataAtom } from '../../hooks/atoms/atoms入力_sibyl';
import { formDataAtom as lohdimFormDataAtom } from '../../hooks/atoms/atoms入力_lohdim';
import { formatDataForInputTxt } from '../utils/formatters';
import { Message } from './Message';
import { convertToLohdimFormat } from '../../components/common/convertToLohdimFormat';
import { parseIniFormat } from '../../components/common/parseIniFormat';
import { atom計算進捗_現在, atom計算進捗_合計 } from '../../hooks/atoms/atoms計算タブ';
import { useMessage } from '@renderer/hooks/components/useInputMessage';
import { mapLohdimDataToFormData } from '../../components/common/lohdimMapper';
import { atomInputRefreshTrigger } from '../../hooks/atoms/deriv計算_入力';

export interface Params計算 {
  pathLohdimLes: string
  pathSibyl: string
  path入力LohdimLes: string
  path入力Sibyl: string
  run大気拡散: boolean
  run線量評価: boolean
}

const labelWidth = 120

export function Tab計算() {
  const {t} = useTranslation();
  const {
    lohdimLes入力フォルダ,
    lohdimLes実行ファイル,
    lohdimLes有効,
    sibyl入力フォルダ,
    sibyl実行ファイル,
    sibyl有効,
    is計算可能,
    is計算中,      
    extension,
    setLohdimLes入力フォルダ,
    setLohdimLes実行ファイル,
    setLohdimLes有効,
    setSibyl入力フォルダ,
    setSibyl実行ファイル,
    setSibyl有効,
    run計算,
    exists
  } = useTab計算()
  const [currentCount, setCurrentCount] = useAtom(atom計算進捗_現在);
  const [totalCount, setTotalCount] = useAtom(atom計算進捗_合計);
  const [lohdimFormData, setLohdimFormData] = useAtom(lohdimFormDataAtom);
  const message = useMessage();
  const setInputRefresh = useSetAtom(atomInputRefreshTrigger);
  
  // LOHDIMの入力フォームデータ（ファイル名や建物計算フラグ）を取得
  const [isFilesReady, setIsFilesReady] = useState(true);

  // ファイルチェック & データ自動リロード処理
  useEffect(() => {

    // 計算中はファイルチェックや合計ステップ数の計算をしない
    if (is計算中) return;

    let isMounted = true;

    const validateFiles = async () => {
      // LOHDIMが無効なら、LOHDIMのファイルチェックはOK扱い（スキップ）
      if (!lohdimLes有効) {
        if (isMounted) setIsFilesReady(true);
        
        if (sibyl有効 && sibyl入力フォルダ) {
          try {
            // フォルダ内のファイル一覧を取得
            const paths = await window.tasks.getOutputPaths('', sibyl入力フォルダ);
            let sibylTotal = 0;
            
            // 有効なSIBYL用インプットデータの個数をループで数え上げる
            for (const num in paths) {
              if (num === '000' || num === '0000') continue;
              if (paths[num].sibylGround || paths[num].sibylPlume) {
                sibylTotal++;
              }
            }
            // 正しい個数をセット
            setTotalCount(sibylTotal);
            setCurrentCount(0);
          } catch (e) {
            setTotalCount(0);
          }
        } else {
          // SIBYLもOFFなら進捗はゼロ
          setTotalCount(0);
          setCurrentCount(0);
        }

        return;
      }

      if (!lohdimLes入力フォルダ) {
        if (isMounted) setIsFilesReady(false);
        return;
      }

      // Atomが空かどうかに関わらず、フォルダパスが有効なら必ずファイルを読みに行くように変更
      let currentData = lohdimFormData;

      try {
        const inputPath = await window.electronAPI.join(lohdimLes入力フォルダ, 'LOHDIM-LES_input.data');
        const tempPath = await window.electronAPI.join(lohdimLes入力フォルダ, 'tempLOHDIM-LES_input.data');

        let dataContent = '';
        // tempファイルがあればそれを優先、なければ正規ファイルを読み込む
        if (await window.electronAPI.exists(tempPath)) {
            dataContent = await window.electronAPI.readFile(tempPath);
        } else if (await window.electronAPI.exists(inputPath)) {
            dataContent = await window.electronAPI.readFile(inputPath);
        }

        if (dataContent) {
            const inputformdata = convertToLohdimFormat(dataContent);
            const rawData = parseIniFormat(inputformdata);
            const loadedFormData = mapLohdimDataToFormData(rawData);

            // 読み込んだデータでローカル変数を更新
            currentData = loadedFormData;

            // Atomも更新（画面の再描画と整合性のため）
            if (isMounted) setLohdimFormData(loadedFormData);

            const nmax = parseInt(rawData.CALC_END)
            const n1 = parseInt(rawData.OUTPUT_START)
            const avetime = parseFloat(rawData.OUTPUT_INTERVAL)
            const dt = parseFloat(rawData.STEP_INTERVAL)
            
            let calculatedTotal = 0

            if(lohdimLes有効){
                calculatedTotal += Math.floor((nmax-n1)/(avetime/dt))
            }

            if(sibyl有効){
                calculatedTotal += Math.floor((nmax-n1)/(avetime/dt)) 
            }

            setTotalCount(calculatedTotal)
            setCurrentCount(0)


        } else {
            // ファイル自体がない場合
            if (isMounted) setIsFilesReady(false);
            return;
        }
      } catch (e) {
        if (isMounted) setIsFilesReady(false);
        return;
      }

      // 必要なファイルの存在チェック
      const filesToCheck = [
        { key: '基本設定ファイル', value: 'LOHDIM-LES_input.data' },
      ];
      // const filesToCheck = [
      //   { key: '基本設定ファイル', value: 'LOHDIM-LES_input.data' },
      //   { key: 'emissionRateData', value: currentData.emissionRateData },
      //   { key: 'verticalMeshData', value: currentData.verticalMeshData }
      // ];

      if (currentData.bldgTerrainCalc === '1') {
        filesToCheck.push({ key: 'buildingData', value: currentData.buildingData });
        filesToCheck.push({ key: 'terrainData', value: currentData.terrainData });
      }

      for (const item of filesToCheck) {
        const rawValue = item.value || ""
        const cleanedValue = rawValue.replace(/['"]/g, "").trim();

        if (cleanedValue === "") {
          if (isMounted) setIsFilesReady(false);
          return;
        }

        const fullPath = await window.electronAPI.join(lohdimLes入力フォルダ, cleanedValue);
        const exists = await window.electronAPI.exists(fullPath);

        if (!exists) {
          if (isMounted) setIsFilesReady(false);
          return;
        }
      }

      if (isMounted) setIsFilesReady(true);
    };

    validateFiles();

    return () => { isMounted = false; };
  }, [
    is計算中,
    lohdimLes有効,
    sibyl有効,
    lohdimLes入力フォルダ,
    setLohdimFormData,
    setTotalCount,
  ]);

  const DEBUG_PROGRESS = true;
  const handleChange = (e) => {
    setFilePath(e.target.value);
  }

  const run計算WithProgress = async () => {
    setCurrentCount(0)
    
    //現在時刻の取得
    const startTime = Date.now()
    
    let targetPrefix = null
    let targetPrefix_forsibyl = null

    if(lohdimLes有効){
        targetPrefix = "(?:GUI_GROUND|GUI_PLUME)";
    }
    if(sibyl有効){
        targetPrefix_forsibyl = "(?:GUI_DOSE|SIBYL_RESULT)";
    }


    let currentMax = 0
    let pollTick = 0

     // 各計算の進捗は、実行後のクリーンアップ等でファイルが消えても値が減らないように保持する
     let lohdimMaxSeen = 0
     let sibylMaxSeen = 0

    while(currentMax < totalCount){
        await new Promise(resolve => setTimeout(resolve,500))
        pollTick += 1
        const elapsed = Date.now() - startTime
         let checkedMax = 0
         if(lohdimLes有効){
             const v = await window.electronAPI.checkFileProgress(
                 lohdimLes実行ファイル,
                 targetPrefix,
                 startTime
             );
             lohdimMaxSeen = Math.max(lohdimMaxSeen, v)
         }

         if(sibyl有効){
             const v = await window.electronAPI.checkFileProgressforsibyl(
                 sibyl入力フォルダ,
                 targetPrefix_forsibyl,
                 startTime
             );
             sibylMaxSeen = Math.max(sibylMaxSeen, v)
         }

         checkedMax = lohdimMaxSeen + sibylMaxSeen
        if(checkedMax > currentMax){
            currentMax = checkedMax
            setCurrentCount(currentMax)
        }

        if(currentMax >= totalCount){
           //for safety
            break;
        }

    }
  };

  const progress = totalCount > 0 ? (currentCount / totalCount) * 100 : 0;

  // パスなどが不備なら強制的にスイッチを操作不可にする
  const canToggleLohdim = !!exists?.lohdimLes && (lohdimLes入力フォルダ ?? '').trim() !== '';
  const canToggleSibyl = !!exists?.sibyl && (sibyl入力フォルダ ?? '').trim() !== '';

  // パスが消されたり実行ファイルがない場合、強制的にスイッチをOFFにする
  // これによりis計算可能ロジックが「OFFだからチェック不要」と判断し、ボタンが有効になる
  useEffect(() => {
    // 計算中はファイルチェックをしない
    if (is計算中) return;

    if (lohdimLes有効 && !canToggleLohdim) {
      setLohdimLes有効(false);
    }
  }, [lohdimLes有効, canToggleLohdim, setLohdimLes有効]);

  useEffect(() => {
    // 計算中はファイルチェックをしない
    if (is計算中) return;

    if (sibyl有効 && !canToggleSibyl) {
      setSibyl有効(false);
    }
  }, [sibyl有効, canToggleSibyl, setSibyl有効]);


  return (
    <Stack spacing={2} sx={{ height: '100%', pt: 3, pb: 2, px: 2, position: 'relative' }}>
      {/* 設定タブの入力が済んでいない場合グレーアウト */}
      <Message />

      {/* 実行設定ボタン */}
      <Stack direction="row" spacing={8}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography color={!canToggleLohdim ? 'text.disabled' : 'text.primary'}> {t("lohdim_exe")}</Typography>
          <Switch実行 
            checked={lohdimLes有効 && canToggleLohdim} 
            onChange={(val) => {
               if (canToggleLohdim) setLohdimLes有効(val);
             }} 
            disabled={!canToggleLohdim}
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography color={!canToggleSibyl ? 'text.disabled' : 'text.primary'}>{t("sibyl_exe")}</Typography>
          <Switch実行 
            checked={sibyl有効 && canToggleSibyl} 
            onChange={(val) => {
               if (canToggleSibyl) setSibyl有効(val);
             }}
            disabled={!canToggleSibyl}
          />
        </Stack>
      </Stack>
        <Typography sx={{ minWidth: 80, textAlign: 'left', fontWeight: 'bold' }}>
           {totalCount > 0 ? `${t("calc_step")}:${totalCount}` : `${t("calc_step")}: -`}
        </Typography>

        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
                marginTop: 2,
                paddingRight: 3,
            }}
        >
        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={<PlayCircleOutline />}
	      disabled={!is計算可能 || is計算中 || !isFilesReady || !!message}
          onClick={async () => {
            await Promise.all([
                run計算(),
                run計算WithProgress()
            ]);
            setInputRefresh((prev) => prev + 1)
          }}
          sx={{zIndex: 1,marginRight: 2}}
        >
	    {is計算中
    ? t("calculating_calculation_button")        
    : t("start_calculation_button")} 
        </Button>
        </Box> 

      {/* 計算開始と進捗バー */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ alignSelf: 'end', mt: '24px !important', width: '100%'}}>
        {/* 進捗バーとラベル */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
          <Typography sx={{ pr: 1 }} color='text.secondary'>{t("progress_label")}</Typography>
          <Box sx={{ flexGrow: 1, my: 1}}>
            <LinearProgress sx={{ height: 16 }} variant='determinate' value={progress}/> 
          </Box>
        </Stack>
        <Typography sx={{ minWidth: 80, textAlign: 'right', fontWeight: 'bold' }}>
        {totalCount > 0 ? `${currentCount} / ${totalCount}` : "- / -"}
        </Typography>
        {/*<Typography sx={{ width: 40, textAlign: 'right', fontWeight: 'bold' }}>
            {`${progress}%`}
          </Typography>*/}
      </Stack>
    </Stack>
  )
}

/**
 * "大気拡散計算"などのラベル
 */
function Title({
  children,
  width,
  disabled
}: {
  children: React.ReactNode
  width: number
  disabled?: boolean
}): JSX.Element {
  return (
    <Typography
      color={disabled ? 'textDisabled' : 'primary'}
      sx={{
        fontSize: '1.1rem',
        width: width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
        {children}
    </Typography>
  )
}

/**
 * 「実行」というラベルを持つスイッチ
 */
function Switch実行({
  checked,
  onChange,
  disabled
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}): JSX.Element {
  const {t} = useTranslation();

  return (
    <FormControlLabel
      control={<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled}/>}
      sx={{ pr: 1 }}
    />
  )
}

