'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { WelcomeScreen } from '@/components/welcome-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { ToneSelector } from './tone-selector'
import { ChatHeader } from './chat-header'
import { ChatSuggestions } from './chat-suggestions'
import { bingConversationStyleAtom } from '@/state'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import StopIcon from '@/assets/images/stop.svg'
import { useBing } from '@/lib/hooks/use-bing'
import { ChatMessageModel } from '@/lib/bots/bing/types'
import { ChatNotification } from './chat-notification'
import { Settings } from './settings'
import { ChatHistory } from './chat-history'

export type ChatProps = React.ComponentProps<'div'> & { initialMessages?: ChatMessageModel[] }

export default function Chat({ className }: ChatProps) {

  const [bingStyle, setBingStyle] = useAtom(bingConversationStyleAtom)
  const {
    messages,
    sendMessage,
    resetConversation,
    stopGenerating,
    setInput,
    bot,
    input,
    generating,
    isSpeaking,
    uploadImage,
    attachmentList,
    setAttachmentList,
  } = useBing()

  useEffect(() => {
    window.scrollTo({
      top: document.body.offsetHeight,
      behavior: 'smooth'
    })
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <Settings />
      <div className={cn('flex-1 pb-16', className)}>
        <ChatHeader />
        <WelcomeScreen setInput={setInput} />
        <ToneSelector type={bingStyle} onChange={setBingStyle} />
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={generating} />
            <ChatNotification message={messages.at(-1)} bot={bot} />
            <ChatSuggestions setInput={setInput} suggestions={messages.at(-1)?.suggestedResponses} />

            {generating ? (
              <div className="flex h-10 items-center justify-center my-4">
                <button
                  onClick={stopGenerating}
                  className="typing-control-item stop"
                >
                  <Image alt="stop" src={StopIcon} width={24} className="mr-1" />
                  <span>停止响应</span>
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <ChatPanel
        className="pt-24 z-10"
        isSpeaking={isSpeaking}
        generating={generating}
        sendMessage={sendMessage}
        input={input}
        setInput={setInput}
        resetConversation={resetConversation}
        uploadImage={uploadImage}
        attachmentList={attachmentList}
        setAttachmentList={setAttachmentList}
      />
      <ButtonScrollToBottom />
    </div>
  )
}
