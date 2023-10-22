'use client'

import React, { useCallback, useEffect, KeyboardEvent } from 'react'
import Textarea from 'react-textarea-autosize'
import { useAtomValue } from 'jotai'
import { cn } from '@/lib/utils'

import NewTopic from '@/assets/images/new-topic.svg'
import VisualSearchIcon from '@/assets/images/visual-search.svg'
import SendFillIcon from '@/assets/images/send-fill.svg'
import SendIcon from '@/assets/images/send.svg'

import { BingReturnType } from '@/lib/hooks/use-bing'
import { voiceListenAtom } from '@/state'
import Voice from './voice'
import { ChatImage } from './chat-image'
import { ChatAttachments } from './chat-attachments'
import { SVG } from './ui/svg'
import { ChatPrompts } from './chat-prompts'
import { debug } from '@/lib/isomorphic'

export interface ChatPanelProps
  extends Pick<
    BingReturnType,
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

  const [focused, setFocused] = React.useState(false)
  const [tid, setTid] = React.useState<any>()
  const voiceListening = useAtomValue(voiceListenAtom)

  const onSend = useCallback(async () => {
    setTimeout(() => {
      window.scrollTo({
        top: document.body.offsetHeight,
        behavior: 'smooth'
      })
    }, 200)

    if (generating) {
      return;
    }
    const input = inputRef.current?.value || ''
    if (!input?.trim()) {
      return
    }
    setInput('')
    await sendMessage(input)
  }, [generating, input, sendMessage, setInput])

  const onSubmit = useCallback(async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    debug('event key', event.key)
    if (
      event.shiftKey ||
      event.ctrlKey ||
      event.nativeEvent.isComposing ||
      event.key !== 'Enter'
    ) {
      return
    }
    event.preventDefault()

    onSend()
  }, [onSend, generating, attachmentList])

  const setBlur = useCallback(() => {
    clearTimeout(tid)
    const _tid = setTimeout(() => setFocused(false), 2000);
    setTid(_tid)
  }, [tid])

  const setFocus = useCallback(() => {
    setFocused(true)
    clearTimeout(tid)
    inputRef.current?.focus()
  }, [tid])

  useEffect(() => {
    if (input) {
      setFocus()
    }

  }, [input, setFocus])

  return (
    <div className={cn('chat-panel relative', className)}>
      <div className="action-bar pb-4">
        <div className="action-root" speech-state="hidden" visual-search="" drop-target="">
          <div className="fade bottom">
            <div className="background"></div>
          </div>
          <div className={cn('outside-left-container', { collapsed: focused })}>
            <div className="button-compose-wrapper">
              <button className="body-2 button-compose" type="button" aria-label="新主题" onClick={resetConversation}>
                <div className="button-compose-content">
                  <SVG className="pl-2" alt="new topic" src={NewTopic} width={40} fill="currentColor" />
                  <div className="button-compose-text">新主题</div>
                </div>
              </button>
            </div>
          </div>
          <div
            className={cn('main-container')}
            onClick={setFocus}
            onBlur={setBlur}
          >
            {input.startsWith('/') && (
              <ChatPrompts onChange={setInput} filter={input.slice(1)} />
            )}

            <div className="main-bar">
              <Textarea
                ref={inputRef}
                tabIndex={0}
                onKeyDown={onSubmit}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 8000))}
                placeholder={voiceListening ? '持续对话中...对话完成说“发送”即可' : 'Shift + Enter 换行，输入 / 选择提示词'}
                spellCheck={false}
                className="message-input min-h-[24px] w-full text-base resize-none bg-transparent focus-within:outline-none"
              />
              <Voice className="action-button" setInput={setInput} sendMessage={sendMessage} isSpeaking={isSpeaking} input={input} />
            </div>
            <ChatAttachments attachmentList={attachmentList} setAttachmentList={setAttachmentList} uploadImage={uploadImage} />
            <div className="body-1 bottom-bar">
              <div className="action-button">
                <ChatImage uploadImage={uploadImage}>
                  <SVG className="cursor-pointer" src={VisualSearchIcon} width={20} />
                </ChatImage>
              </div>
              <div className="flex gap-2 items-center">
                <div className="letter-counter"><span>{input.length}</span>/8000</div>
                <button type="submit" className="action-button" onClick={onSend}>
                  <SVG alt="send" src={input.length ? SendFillIcon : SendIcon} width={18} height={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
