import React from 'react'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { ChatMessageModel } from '@/lib/bots/bing/types'

export interface ChatList {
  messages: ChatMessageModel[]
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="chat-container relative flex flex-col">
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          <ChatMessage message={message} index={index} />
          {index < messages.length - 1 && (
            <Separator className="my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
