import { Box, Stack, IconButton, Tooltip, Typography, Button } from '@mui/material';
import { HelpOutline, Home, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from '@mui/icons-material';
import { useMap } from '@renderer/hooks/components/Map/useMap';
import { useAtomValue, useSetAtom } from 'jotai';
import { deriv放出点3D } from '@renderer/hooks/atoms/deriv放出点3D';
import { atomMap設定_視点リセット } from '@renderer/hooks/atoms/atomsMap設定';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nextProvider } from 'react-i18next'; // 削除予定
import i18n from '../../i18n'; // 削除予定

export function MapButtons(): JSX.Element {
  const { t, i18n: i18nInstance } = useTranslation();
  const { open地図設定, toggleOpen地図設定 } = useMap();
  const 放出点 = useAtomValue(deriv放出点3D);
  const set視点リセット = useSetAtom(atomMap設定_視点リセット);

  const handle視点リセット = useCallback(() => set視点リセット(new Date().getTime()), [set視点リセット]);
  const disabledGoHome = !放出点;
  const changeLanguage = (lng: string) => i18nInstance.changeLanguage(lng);

  const tooltipTitle = useMemo(() => (
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
  ), [t]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        display: 'flex',
        gap: 1,
        zIndex: 100,
        p: 1,
        background: '#fffb',
        borderRadius: '0 0 0 10px',
        flexWrap: 'wrap'
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
  );
}
