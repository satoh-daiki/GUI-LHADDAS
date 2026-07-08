import React, { useState } from 'react'
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
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { formDataAtom, FormData } from '../../hooks/atoms/atoms入力_sibyl.ts'

/**
 * 入力タブのコンポーネント
 */
export function Tab入力(): JSX.Element {
  const { t } = useTranslation()
  // Jotaiから状態と更新関数を取得
  const [formData, setFormData] = useAtom(formDataAtom)

  // アコーディオンの開閉状態を管理するstate
  const [expandedRed, setExpandedRed] = useState<boolean>(true) // 赤字フィールド (基本設定/領域設定)
  const [expandedBlack, setExpandedBlack] = useState<boolean>(true) // 黒字フィールド (タイトル/計算設定)

  const handleRedAccordionChange = () => {
    setExpandedRed(!expandedRed)
  }
  const handleBlackAccordionChange = () => {
    setExpandedBlack(!expandedBlack)
  }

  // ===========================================
  // ヘルパー関数群 (Jotai Atomの更新ロジック)
  // ===========================================

  // トップレベルのフィールドを更新するヘルパー
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ネストされたフィールド (領域や障害物) を更新するヘルパー
  const updateNestedField = (section: keyof FormData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value
      } as any
    }))
  }

  // ===========================================
  // イベントハンドラ (すべてのハンドラを定義)
  // ===========================================

  // 基本情報
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField('title', event.target.value)
  }
  const handleNuclideChange = (event: { target: { value: string | unknown } }) => {
    updateField('nuclide', event.target.value as string)
  }
  const handleDoseRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('doseRateType', event.target.value)
  }
  const handleCellSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateField('cellSize', event.target.value)
  }

  // 線源領域
  const handleSourceXStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('source', 'xStart', event.target.value)
  }
  const handleSourceXEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('source', 'xEnd', event.target.value)
  }
  const handleSourceYStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('source', 'yStart', event.target.value)
  }
  const handleSourceYEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('source', 'yEnd', event.target.value)
  }
  const handleSourceZStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('source', 'zStart', event.target.value)
  }
  const handleSourceZEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('source', 'zEnd', event.target.value)
  }

  // 標的領域
  const handleTargetAreaXStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('target', 'xStart', event.target.value)
  }
  const handleTargetAreaXEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('target', 'xEnd', event.target.value)
  }
  const handleTargetAreaYStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('target', 'yStart', event.target.value)
  }
  const handleTargetAreaYEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('target', 'yEnd', event.target.value)
  }
  const handleTargetAreaZStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('target', 'zStart', event.target.value)
  }
  const handleTargetAreaZEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('target', 'zEnd', event.target.value)
  }

  // 障害物
  const handleGammaChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateNestedField('obstacle', 'gamma', event.target.value)
  }
  const handleEffectiveDensityChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('obstacle', 'effectiveDensity', event.target.value)
  }
  const handleZMaxCellChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('obstacle', 'zMaxCell', event.target.value)
  }

  // 計算領域
  const handleCalcAreaXStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('calcArea', 'xStart', event.target.value)
  }
  const handleCalcAreaXEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('calcArea', 'xEnd', event.target.value)
  }
  const handleCalcAreaYStartChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('calcArea', 'yStart', event.target.value)
  }
  const handleCalcAreaYEndChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNestedField('calcArea', 'yEnd', event.target.value)
  }
  // ===========================================

  /**
   * 領域入力用のコンポーネント（線源領域、標的領域などで共通）
   */
  const RegionInput = ({ isSource }: { isSource: boolean }) => {
    // 適切なデータとハンドラを取得するロジックをここに定義
    const section = isSource ? formData.source : formData.target

    const xStartValue = section.xStart
    const xEndValue = section.xEnd
    const yStartValue = section.yStart
    const yEndValue = section.yEnd
    // 標的領域ではZ座標はないが、コード上は存在するため、変数だけ定義
    const zStartValue = section.zStart
    const zEndValue = section.zEnd

    const xStartHandler = isSource ? handleSourceXStartChange : handleTargetAreaXStartChange
    const xEndHandler = isSource ? handleSourceXEndChange : handleTargetAreaXEndChange
    const yStartHandler = isSource ? handleSourceYStartChange : handleTargetAreaYStartChange
    const yEndHandler = isSource ? handleSourceYEndChange : handleTargetAreaYEndChange
    const zStartHandler = isSource ? handleSourceZStartChange : handleTargetAreaZStartChange
    const zEndHandler = isSource ? handleSourceZEndChange : handleTargetAreaZEndChange

    return (
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={3.5}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {t('x-direction')}
          </Typography>
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
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {t('y-direction')}
          </Typography>
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
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {t('z-direction')}
              </Typography>
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

  /**
   * 障害物・計算領域の入力部分
   */
  const BottomSection = () => (
    <Grid container spacing={2}>
      {/* 障害物 */}
      <Grid item xs={6}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {t('obstacle')}
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ flexGrow: 0.5 }}>
              {t('gamma-attenuation-coefficient')}
            </Typography>
            <TextField
              size="small"
              sx={{ width: '40%' }}
              value={formData.obstacle.gamma}
              onChange={handleGammaChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ flexGrow: 0.5 }}>
              {t('effective-density')}
            </Typography>
            <TextField
              size="small"
              sx={{ width: '40%' }}
              value={formData.obstacle.effectiveDensity}
              onChange={handleEffectiveDensityChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ flexGrow: 0.5 }}>
              {t('z-max-cell-number')}
            </Typography>
            <TextField
              size="small"
              sx={{ width: '40%' }}
              value={formData.obstacle.zMaxCell}
              onChange={handleZMaxCellChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Box>
        </Stack>
      </Grid>

      {/* 計算領域 */}
      <Grid item xs={6}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {t('calc-region')}
        </Typography>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={4}>
            {/* 空白 */}
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" align="center" sx={{ fontSize: '0.75rem' }}>
              {t('start-cell-number')}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" align="center" sx={{ fontSize: '0.75rem' }}>
              {t('end-cell-number')}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {t('x-direction')}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              fullWidth
              value={formData.calcArea.xStart}
              onChange={handleCalcAreaXStartChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              fullWidth
              value={formData.calcArea.xEnd}
              onChange={handleCalcAreaXEndChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Grid>

          <Grid item xs={4}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {t('y-direction')}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              fullWidth
              value={formData.calcArea.yStart}
              onChange={handleCalcAreaYStartChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              fullWidth
              value={formData.calcArea.yEnd}
              onChange={handleCalcAreaYEndChange}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )

  return (
    <Box sx={{ position: 'relative', pb: 8 }}>
      <Stack spacing={3} sx={{ pt: 3, pb: 2, px: 2, maxWidth: 1000, mx: 'auto' }}>
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
              {t('required-fields')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Box /> {/* スペースのため */}
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
                    <MenuItem value={'Cs-134'}>Cs-134</MenuItem>
                    <MenuItem value={'Cs-136'}>Cs-136</MenuItem>
                    <MenuItem value={'Cs-137'}>Cs-137</MenuItem>
                    <MenuItem value={'I-131'}>I-131</MenuItem>
                    <MenuItem value={'I-132'}>I-132</MenuItem>
                    <MenuItem value={'I-133'}>I-133</MenuItem>
                    <MenuItem value={'Kr-85'}>Kr-85</MenuItem>
                    <MenuItem value={'Te-132'}>Te-132</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* 出力する線量率 & セルの水平方向幅*/}
              <Grid container spacing={0} alignItems="flex-end">
                {/* 出力する線量率*/}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ minWidth: 100 }}>
                      {t('output-dose-rate')}
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
                            {t('ambient-dose-equivalent-rate')}
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="airkerma"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2">{t('air-kerma-rate')}</Typography>}
                      />
                    </RadioGroup>
                  </Box>
                </Grid>

                {/* セルの水平方向幅 */}
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ minWidth: 180 }}>
                      {t('cell-horizontal-width')}
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
              <Grid container spacing={2}>
                {/* 線源領域 */}
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('source-region')}
                  </Typography>
                  <RegionInput isSource={true} />
                </Grid>
                {/* 標的領域 */}
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('target-region')}
                  </Typography>
                  <RegionInput isSource={false} />
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
              {t('optional-fields')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* タイトル - 黒字 */}
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
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <BottomSection />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  )
}
