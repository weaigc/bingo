import './index.scss'

export default function Voice(props: React.ComponentProps<'div'>) {
  return (
    <div className="voice-button" {...props}>
      {Array.from({ length: 8 }).map((_, index) => <div key={index} />)}
    </div>
  )
}
