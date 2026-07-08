import { useAtom, useSetAtom } from 'jotai';
import { atomGlobal_tabName } from './atoms/atomsGlobal';
import { useCallback } from 'react';
import { deriv可視化_Reset } from './atoms/deriv可視化_Reset';

export function useApp() {
  const [tabName, setTabName] = useAtom(atomGlobal_tabName);
  const reset可視化タブ = useSetAtom(deriv可視化_Reset);

  const tabIndex = (() => {
    switch (tabName) {
      case '設定タブ':
        return 0;
      case 'LOHDIM入力タブ':
        return 1;
      case 'SIBYL入力タブ':
        return 2;
      case '計算タブ':
        return 3;
      case '可視化タブ':
        return 4;
      default:
        return 0;    
    }
  })();

  const setTabIndex = useCallback((_: React.SyntheticEvent, index: number) => {
    switch (index) {
      case 0:
        setTabName('設定タブ');
        break;
      case 1:
        setTabName('LOHDIM入力タブ');
        break;
      case 2:
        setTabName('SIBYL入力タブ');
        break;
      case 3:
        setTabName('計算タブ');
        break;
      case 4:
        setTabName('可視化タブ');
        reset可視化タブ();
        break;
      default:
        setTabName('設定タブ');
        break;
    }
  }, [setTabName, reset可視化タブ]);

  return {
    tabIndex,
    setTabIndex
  };
}
