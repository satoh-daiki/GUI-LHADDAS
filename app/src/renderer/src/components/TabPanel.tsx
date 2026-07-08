import { BoxProps } from '@mui/material'

// https://mui.com/material-ui/react-tabs/

/**
 * タブの中身をこれに入れる
 */
export function TabPanel({
  children,
  value,
  index
}: {
  children?: React.ReactNode
  index: number
  value: number
} & BoxProps): JSX.Element {
  return <div hidden={value !== index}>{value === index && children}</div>
}
