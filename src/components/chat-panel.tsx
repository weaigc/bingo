'use client'

import * as React from 'react'
import Image from 'next/image'
import Textarea from 'react-textarea-autosize'
import { useAtomValue } from 'jotai'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'

import BrushIcon from '@/assets/images/brush.svg'
import ChatIcon from '@/assets/images/chat.svg'
import VisualSearchIcon from '@/assets/images/visual-search.svg'
import SendIcon from '@/assets/images/send.svg'
import PinIcon from '@/assets/images/pin.svg'
import PinFillIcon from '@/assets/images/pin-fill.svg'

import { useBing } from '@/lib/hooks/use-bing'
import { voiceListenAtom } from '@/state'
import Voice from './voice'
import { ChatImage } from './chat-image'
import { ChatAttachments } from './chat-attachments'

export interface ChatPanelProps
  extends Pick<
    ReturnType<typeof useBing>,
    | 'generating'
    | 'input'
    | 'setInput'
    | 'sendMessage'
    | 'resetConversation'
    | 'isSpeaking'
    | 'attachmentList'
    | 'uploadImage'
    | 'setAttachmentList'
  > {
  id?: string
  className?: string
}

export function ChatPanel({
  isSpeaking,
  generating,
  input,
  setInput,
  className,
  sendMessage,
  resetConversation,
  attachmentList,
  uploadImage,
  setAttachmentList
}: ChatPanelProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const {formRef, onKeyDown} = useEnterSubmit()
  const [focused, setFocused] = React.useState(false)
  const [active, setActive] = React.useState(false)
  const [pin, setPin] = React.useState(false)
  const [tid, setTid] = React.useState<any>()
  const voiceListening = useAtomValue(voiceListenAtom)

  const setBlur = React.useCallback(() => {
    clearTimeout(tid)
    setActive(false)
    const _tid = setTimeout(() => setFocused(false), 2000);
    setTid(_tid)
  }, [tid])

  const setFocus = React.useCallback(() => {
    setFocused(true)
    setActive(true)
    clearTimeout(tid)
    inputRef.current?.focus()
  }, [tid])

  React.useEffect(() => {
    if (input) {
      setFocus()
    }
  }, [input, setFocus])

  return (
    <form
      className={cn('chat-panel', className)}
      onSubmit={async e => {
        e.preventDefault()
        if (generating) {
          return;
        }
        if (!input?.trim()) {
          return
        }
        setInput('')
        setPin(false)
        await sendMessage(input)
      }}
      ref={formRef}
    >
      <div className="action-bar pb-4">
        <div className={cn('action-root', { focus: active || pin })} speech-state="hidden" visual-search="" drop-target="">
          <div className="fade bottom">
            <div className="background"></div>
          </div>
          <div className={cn('outside-left-container', { collapsed: focused })}>
            <div className="button-compose-wrapper">
              <button className="body-2 button-compose" type="button" aria-label="新主题" onClick={resetConversation}>
                <div className="button-compose-content">
                  <Image className="pl-2" alt="brush" src={BrushIcon} width={40} />
                  <div className="button-compose-text">新主题</div>
                </div>
              </button>
            </div>
          </div>
          <div
            className={cn('main-container', { active: active || pin })}
            style={{ minHeight: pin ? '360px' : undefined }}
            onClick={setFocus}
            onBlur={setBlur}
          >
            <div className="main-bar">
              <Image alt="chat" src={ChatIcon} width={20} color="blue" />
              <Textarea
                ref={inputRef}
                tabIndex={0}
                onKeyDown={onKeyDown}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 4000))}
                placeholder={voiceListening ? '持续对话中...对话完成说“发送”即可' : 'Shift + Enter 换行'}
                spellCheck={false}
                className="message-input min-h-[24px] -mx-1 w-full text-base resize-none bg-transparent focus-within:outline-none"
              />
              <ChatImage uploadImage={uploadImage}>
                <Image alt="visual-search" src={VisualSearchIcon} width={24} />
              </ChatImage>
              <Voice setInput={setInput} sendMessage={sendMessage} isSpeaking={isSpeaking} input={input} />
              <button type="submit">
                <Image alt="send" src={SendIcon} width={20} style={{ marginTop: '2px' }} />
              </button>
            </div>
            <ChatAttachments attachmentList={attachmentList} setAttachmentList={setAttachmentList} uploadImage={uploadImage} />
            <div className="body-1 bottom-bar">
              <div className="letter-counter"><span>{input.length}</span>/4000</div>
              <button onClick={() => {
                setPin(!pin)
              }} className="pr-2">
               <Image alt="pin" src={pin ? PinFillIcon : PinIcon} width={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
