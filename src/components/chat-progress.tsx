import { MemoizedReactMarkdown } from "./markdown"
import { SVG } from "./ui/svg"
import CheckMarkIcon from '@/assets/images/check-mark.svg'

interface ChatProgressProps {
  progress?: string[]
}

export function ChatProgress({ progress = [] }: ChatProgressProps) {
  return progress?.length ? (
    <div className="chat-progress my-3">
      {progress.map((item, index) => (
        <div key={index} className="chat-progress__item">
          <SVG src={CheckMarkIcon} width={28} fill="#13a10e" />
          <div className="body-1 meta-text">
            <MemoizedReactMarkdown>{item}</MemoizedReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  ) : null
}
