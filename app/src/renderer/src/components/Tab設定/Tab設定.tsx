import { FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { TextFieldSelectPath } from './../TextFieldSelectPath'
import { useTab計算 } from '@renderer/hooks/components/Tab計算/useTab計算'
import { useTranslation } from 'react-i18next';

const labelWidth = 120

export function Tab設定() {
  const {t} = useTranslation();
  const {
    lohdimLes入力フォルダ,
    lohdimLes実行ファイル,
    lohdimLes有効,
    sibyl入力フォルダ,
    sibyl実行ファイル,
    sibyl有効,
    extension,
    setLohdimLes入力フォルダ,
    setLohdimLes実行ファイル,
    setLohdimLes有効,
    setSibyl入力フォルダ,
    setSibyl実行ファイル,
    setSibyl有効,
    exists,
    is計算中
  } = useTab計算()

  return (
    <Stack spacing={2} sx={{ pt: 3, pb: 2, px: 2 }}>
      {/* 大気拡散計算 (Lohdim-Les) 設定 */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Title 
          disabled={!lohdimLes有効} 
          width={labelWidth} 
        >
          {t("atmospheric_diffusion_label")}
        </Title>
        <TextFieldSelectPath
          label={t("lohdim_les_exec_file_label")}
          value={lohdimLes実行ファイル}
          error={!exists?.lohdimLes}
          disabled={!lohdimLes有効}
          filterName="実行ファイル"
          filterExtension={extension}
          type={'file'}
          multiline={false}
          stackSx={{ flexGrow: 1 }}
          onChangeText={setLohdimLes実行ファイル}
        />
        <TextFieldSelectPath
          label={t("lohdim_les_input_folder_label")}
          value={lohdimLes入力フォルダ}
          error={!exists?.lohdimLes入力}
          type={'folder'}
          onChangeText={setLohdimLes入力フォルダ}
          stackSx={{ flexGrow: 3 }}
          disabled={is計算中}
        />
      </Stack>

      {/* 線量評価計算 (Sibyl) 設定 */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Title disabled={!sibyl有効} width={labelWidth}>
          {t("dose_evaluation_label")}
        </Title>
        <TextFieldSelectPath
          label={t("sibyl_exec_file_label")}
          value={sibyl実行ファイル}
          error={!exists?.sibyl}
          disabled={!sibyl有効}
          filterName="実行ファイル"
          filterExtension={extension}
          type={'file'}
          multiline={false}
          stackSx={{ flexGrow: 1 }}
          onChangeText={setSibyl実行ファイル}
        />
        <TextFieldSelectPath
          label={t("sibyl_input_folder_label")}
          value={sibyl入力フォルダ}
          error={!exists?.sibyl入力}
          disabled={is計算中}
          type={'folder'}
          stackSx={{ flexGrow: 3 }}
          onChangeText={setSibyl入力フォルダ}
        />
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
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: 1.2,
      }}
    >
        {children}
    </Typography>
  )
}

