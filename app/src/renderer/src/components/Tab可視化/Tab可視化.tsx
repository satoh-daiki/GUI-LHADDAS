import { Box, Card, Grid2, Stack } from '@mui/material'
import { Slice } from './Slice'
import { Time } from './Time'
import { Toggle大気中濃度 } from './Toggle大気中濃度'
import { Toggle地表沈着濃度 } from './Toggle地表沈着濃度'
import { Toggle線量率 } from './Toggle線量率'
import { Message } from './Message'

export function Tab可視化(): JSX.Element {
  return (
    <Box sx={{ position: 'relative' }}>
      <Grid2
        container
        columnSpacing={2}
        rowSpacing={1.5}
        sx={{ py: 2, px: 2, maxWidth: 1100, mx: 'auto', position: 'relative' }}
      >
        {/* 時刻 */}
        <Grid2 size={7}>
          <Time />
        </Grid2>

        {/* 左側 */}
        <Grid2 size={6} maxWidth={550}>
          <Card variant="outlined">
            <Stack spacing={1} sx={{ p: 1.5, px: 1 }}>
              {/* 大気中濃度 */}
              <Toggle大気中濃度 />
              {/* スライス */}
              <Slice switchWidth={140} />
            </Stack>
          </Card>
        </Grid2>

        {/* 右側 */}
        <Grid2 size={6} maxWidth={550}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <Stack spacing={1} sx={{ p: 1.5, pl: 1 }}>
              {/* 地表沈着濃度 */}
              <Toggle地表沈着濃度 />
              {/* 線量率 */}
              <Toggle線量率 />
            </Stack>
          </Card>
        </Grid2>
      </Grid2>

      {/* 可視化できないときにメッセージを出す */}
      <Message />
    </Box>
  )
}
