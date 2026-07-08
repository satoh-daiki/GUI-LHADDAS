import { createTheme, ThemeProvider } from '@mui/material'
import { purple, teal } from '@mui/material/colors'

/**
 * 色や、コンポーネントのデフォルトのスタイルを定義する
 */
const theme = createTheme({
  // https://mui.com/material-ui/customization/color/
  palette: {
    primary: teal,
    secondary: purple
  },

  // https://mui.com/material-ui/customization/theme-components/
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
        spellCheck: false,
        fullWidth: true,
        slotProps: {
          inputLabel: {
            shrink: true
          }
        }
      }
    }
  }
})

export function Theme({ children }: { children?: React.ReactNode }): JSX.Element {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
