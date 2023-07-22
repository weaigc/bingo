import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import supersub from 'remark-supersub'
import remarkBreaks from 'remark-breaks'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { LearnMore } from './learn-more'
import { ChatMessageModel } from '@/lib/bots/bing/types'
import { useEffect } from 'react'
import { TurnCounter } from './turn-counter'

export interface ChatMessageProps {
  message: ChatMessageModel
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  useEffect(() => {
    if (document.body.scrollHeight - window.innerHeight - window.scrollY - 200 < 0) {
      window.scrollBy(0, 200)
    }
  }, [message.text])

  return message.text ? (
    <div
      className={cn('text-message', message.author)}
      {...props}
    >
      <div className="text-message-content">
        <MemoizedReactMarkdown
          linkTarget="_blank"
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath, supersub, remarkBreaks]}
          components={{
            p({ children }) {
              return <p className="mb-2">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {message.text}
        </MemoizedReactMarkdown>
      </div>
      <div className="text-message-footer">
        {message.author === 'bot' && <LearnMore sourceAttributions={message.sourceAttributions} />}
        {message.author === 'bot' && <TurnCounter throttling={message.throttling} />}
      </div>
    </div>
  ) : null
}
