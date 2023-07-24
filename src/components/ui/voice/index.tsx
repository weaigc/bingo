import './index.scss'

export default function Voice(props: React.ComponentProps<'div'>) {
  return (
    <div className="voice-button" {...props}>
      {Array.from({ length: 6 }).map(() => <div />)}
    </div>
  )
}
