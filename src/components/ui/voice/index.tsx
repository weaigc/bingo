import { cn } from '@/lib/utils';
import './index.scss'

type VoiceProps = {
  num?: number;
  duration?: number;
  className?: string;
} & React.ComponentProps<'div'>

export default function Voice({ duration = 400, num = 7, className, ...others }: VoiceProps) {
  return (
    <div className={cn('voice-button', className)} { ...others }>
      {Array.from({ length: num }).map((_, index) => {
        const randomDuration = Math.random() * 100 + duration
        const initialDelay = Math.random() * 2 * duration
        const initialScale = Math.sin((index + 1) * Math.PI / num)
        return (
          <div
            className="voice-button-item"
            key={index}
            style={{
              animationDelay: initialDelay + 'ms',
              animationDuration: randomDuration + 'ms',
              transform: `scale(${initialScale})`
            }}
          />
        )
      })}
    </div>
  )
}
