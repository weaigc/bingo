'use client'

import { useEffect } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import supersub from 'remark-supersub'
import remarkBreaks from 'remark-breaks'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { LearnMore } from './learn-more'
import { ChatMessageModel } from '@/lib/bots/bing/types'
import { TurnCounter } from './turn-counter'
import { ChatFeedback } from './chat-feedback'
import { ChatProgress } from './chat-progress'

export interface ChatMessageProps {
  message: ChatMessageModel
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  useEffect(() => {
    if (document.body.scrollHeight - window.innerHeight - window.scrollY - 200 < 0) {
      window.scrollBy(0, 200)
    }
  }, [message.text, message.progress?.length])

  return (
    <div className="response-message-group flex flex-col relative">
      <ChatProgress progress={message.progress} />
      {message.text ? <div
        className={cn('text-message', message.author)}
        {...props}
      >
        <ChatFeedback text={message.text} />

        <div className="text-message-content">
          <MemoizedReactMarkdown
            linkTarget="_blank"
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath, supersub, remarkBreaks]}
            rehypePlugins={[
              rehypeKatex,
            ]}
            components={{
              img(obj) {
                try {
                  const uri = new URL(obj.src!)
                  const w = uri.searchParams.get('w')
                  const h = uri.searchParams.get('h')
                  if (w && h) {
                    uri.searchParams.delete('w')
                    uri.searchParams.delete('h')
                    return <a style={{ float: 'left', maxWidth: '50%' }} href={uri.toString()} target="_blank" rel="noopener noreferrer"><img src={obj.src} alt={obj.alt} width={w!} height={h!} /></a>
                  }
                } catch (e) {
                }
                return <img src={obj.src} alt={obj.alt} title={obj.title} />
              },
              p({ children }) {
                return <p className="mb-2">{children}</p>
              },
              code({ node, inline, className, children, ...props }) {
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
      </div> : null}
    </div>
  )
}
