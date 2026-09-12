import { Button } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useCountdown } from 'usehooks-ts'

export const RetryButton = ({ onRetry }: { onRetry: () => void }) => {
  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: 5,
    intervalMs: 1000,
  })

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  const handleClick = () => {
    onRetry()
    resetCountdown()
    startCountdown()
  }

  return (
    <Button onClick={handleClick} disabled={count > 0} colorPalette="theme" size="sm">
      {count > 0 ? `重試 (${count})` : '重試'}
    </Button>
  )
}
