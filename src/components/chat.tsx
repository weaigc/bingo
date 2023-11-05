'use client'

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
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
import { SVG } from './ui/svg'
import StopIcon from '@/assets/images/stop.svg'
import { useBing } from '@/lib/hooks/use-bing'
import { ChatMessageModel } from '@/lib/bots/bing/types'
import { ChatNotification } from './chat-notification'
import { Settings } from './settings'
import { ChatHistory } from './chat-history'
import { PromptsManage } from './prompts'


export type ChatProps = React.ComponentProps<'div'> & { initialMessages?: ChatMessageModel[] }

export default function Chat({ className }: ChatProps) {
  const [expand, setExpand] = useState(false)
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

  const onExpaned = () => {
    setExpand(true)
  }

  const lastMessage = messages[messages.length - 1]

  return (
    <div className={cn(bingStyle.toLowerCase(), { 'side-panel-expanded': expand })}>
      <PromptsManage insertPrompt={setInput} />
      <ChatHistory onExpaned={onExpaned} />
      <div className="global-background" />
      <Settings />
      <div className="flex justify-center left-0 w-full">
        <div className={cn('main-root items-center flex-1 pb-16', className)}>
          <div className="main-content">
            <ChatHeader />
            <WelcomeScreen setInput={setInput} />
            <ToneSelector type={bingStyle} onChange={setBingStyle} />
            {/* <AdvanceSwither disabled={messages.length >= 2} /> */}
            {messages.length ? (
              <>
                <ChatList messages={messages} />
                <ChatScrollAnchor trackVisibility={generating} />
                <ChatNotification message={lastMessage} bot={bot} />
                {lastMessage?.suggestedResponses && <ChatSuggestions setInput={setInput} suggestions={lastMessage?.suggestedResponses} />}

                {generating ? (
                  <div className="flex h-10 items-center justify-center my-4">
                    <button
                      onClick={stopGenerating}
                      className="typing-control-item stop"
                    >
                      <SVG alt="stop" src={StopIcon} width={24} className="mr-1" />
                      <span>停止响应</span>
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
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
