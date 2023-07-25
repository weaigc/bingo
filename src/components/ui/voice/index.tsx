import './index.scss'

export interface VoiceProps extends CSSPropertyRule {
  num?: number;
  duration?: number;
}
export default function Voice({ duration = 400, num = 7, ...others }) {
  return (
    <div className="voice-button" { ...others }>
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
