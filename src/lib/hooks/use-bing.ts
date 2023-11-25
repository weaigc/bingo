'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chatFamily, bingConversationStyleAtom, GreetMessages, hashAtom, voiceAtom, chatHistoryAtom, isImageOnly, systemPromptsAtom, unlimitAtom, gptAtom } from '@/state'
import { ChatMessageModel, BotId, FileItem, APIMessage, ErrorCode } from '@/lib/bots/bing/types'
import { messageToContext, nanoid } from '../utils'
import { TTS } from '../bots/bing/tts'

export function useBing(botId: BotId = 'bing') {
  const chatAtom = useMemo(() => chatFamily({ botId, page: 'singleton' }), [botId])
  const [chatState, setChatState] = useAtom(chatAtom)
  const setHistoryValue = useSetAtom(chatHistoryAtom)
  const [enableTTS] = useAtom(voiceAtom)
  const [enableGPT4] = useAtom(gptAtom)
  const [systemPrompts] = useAtom(systemPromptsAtom)
  const speaker = useMemo(() => new TTS(), [])
  const unlimit = useAtomValue(unlimitAtom)
  const [hash, setHash] = useAtom(hashAtom)
  const bingConversationStyle = useAtomValue(bingConversationStyleAtom)
  const [input, setInput] = useState('')
  const [attachmentList, setAttachmentList] = useState<FileItem[]>([])

  const updateMessage = useCallback(
    (messageId: string, updater: (message: ChatMessageModel) => void) => {
      setChatState((draft) => {
        const message = draft.messages.find((m) => m.id === messageId)
        if (message) {
          updater(message)
        }
      })
    },
    [setChatState],
  )
  const defaultContext = systemPrompts ? `[system](#additional_instructions)\n${systemPrompts}` : ''
  const historyContext = useMemo(() => {
    return {
      get() {
        const messages = chatState.messages
          .map(message => ({ role: message.author === 'bot' ? 'assistant' : 'user', content: message.text }) as APIMessage)
        return [defaultContext, messageToContext(messages)].filter(Boolean).join('\n')
      }
    }
  }, [chatState.messages])

  const sendMessage = useCallback(
    async (input: string, options = {}) => {
      const botMessageId = nanoid()
      const imageUrl = attachmentList?.[0]?.status === 'loaded' ? attachmentList[0].url : undefined

      setChatState((draft) => {
        const text = imageUrl ? `${input}\n\n![image](${imageUrl})` : input
        draft.messages.push({ id: nanoid(), text, author: 'user' }, { id: botMessageId, text: '', author: 'bot' })
        setAttachmentList([])
      })
      const abortController = new AbortController()
      setChatState((draft) => {
        draft.generatingMessageId = botMessageId
        draft.abortController = abortController
      })
      speaker.reset()

      await chatState.bot.sendMessage({
        prompt: input,
        imageUrl: imageUrl && /api\/blob.jpg\?bcid=([^&]+)/.test(imageUrl) ? `https://www.bing.com/images/blob?bcid=${RegExp.$1}` : imageUrl,
        context: chatState.bot.isInitial ? historyContext.get() : '',
        options: {
          ...options,
          bingConversationStyle,
          allowSearch: !enableGPT4,
        },
        signal: abortController.signal,
        onEvent(event) {
          if (event.type === 'UPDATE_ANSWER') {
            updateMessage(botMessageId, (message) => {
              if (event.data.text.length > message.text.length) {
                message.text = event.data.text
              }

              if (enableTTS) {
                speaker.speak(message.text)
              }
              if (event.data.progressText) {
                message.progress = [...(message.progress ?? []), event.data.progressText]
              }
              message.throttling = event.data.throttling || message.throttling
              message.sourceAttributions = event.data.sourceAttributions || message.sourceAttributions
              message.suggestedResponses = event.data.suggestedResponses || message.suggestedResponses
            })
          } else if (event.type === 'ERROR') {
            if (!unlimit && event.error.code === ErrorCode.CONVERSATION_LIMIT) {
              chatState.bot.resetConversation()
            } else if (event.error.code !== ErrorCode.BING_ABORT) {
              updateMessage(botMessageId, (message) => {
                message.error = event.error
              })
              setChatState((draft) => {
                draft.abortController = undefined
                draft.generatingMessageId = ''
              })
            }
          } else if (event.type === 'DONE') {
            setChatState((draft) => {
              setHistoryValue({
                messages: draft.messages,
              })
              draft.abortController = undefined
              const message = draft.messages[draft.messages.length - 1]
              draft.generatingMessageId = ''
              if ((message?.throttling?.numUserMessagesInConversation??0) >=
                (message?.throttling?.maxNumUserMessagesInConversation??0)
              ) {
                chatState.bot.resetConversation()
              }
            })
          }
        },
      }).catch()
    },
    [botId, unlimit, historyContext, attachmentList, chatState.bot, chatState.conversation, bingConversationStyle, speaker, setChatState, updateMessage],
  )

  const uploadImage = useCallback(async (imgUrl: string) => {
    setAttachmentList([{ url: imgUrl, status: 'loading' }])
    const response = await chatState.bot.uploadImage(imgUrl, bingConversationStyle)
    if (response?.blobId) {
      setAttachmentList([{ url: new URL(`/api/blob.jpg?bcid=${response.blobId}`, location.href).toString(), status: 'loaded' }])
    } else {
      setAttachmentList([{ url: imgUrl, status: 'error' }])
    }
  }, [chatState.bot])

  const stopGenerating = useCallback(() => {
    chatState.abortController?.abort('Cancelled')
    if (chatState.generatingMessageId) {
      updateMessage(chatState.generatingMessageId, (message) => {
        if (!message.text && !message.error) {
          message.text = 'Cancelled'
        }
      })
    }
    setChatState((draft) => {
      draft.generatingMessageId = ''
    })
  }, [chatState.abortController, chatState.generatingMessageId, setChatState, updateMessage])

  const resetConversation = useCallback(() => {
    stopGenerating()
    chatState.bot.resetConversation()
    speaker.abort()
    setChatState((draft) => {
      draft.abortController = undefined
      draft.generatingMessageId = ''
      draft.conversation = {}
      draft.messages = [{ author: 'bot', text: GreetMessages[Math.floor(GreetMessages.length * Math.random())], id: nanoid() }]
    })
  }, [chatState.bot, setChatState, stopGenerating])

  useEffect(() => {
    if (hash === 'reset') {
      resetConversation()
      setHash('')
    }
  }, [hash, setHash, resetConversation])

  const chat = useMemo(
    () => ({
      botId,
      bot: chatState.bot,
      isSpeaking: speaker.isSpeaking,
      messages: chatState.messages,
      input,
      generating: !!chatState.generatingMessageId,
      attachmentList,
    }),
    [
      botId,
      bingConversationStyle,
      chatState.bot,
      chatState.generatingMessageId,
      chatState.messages,
      speaker.isSpeaking,
      input,
      attachmentList,
    ],
  )

  return {
    ...chat,
    resetConversation,
    stopGenerating,
    setInput,
    uploadImage,
    setAttachmentList,
    sendMessage,
  }
}

export type BingReturnType = ReturnType<typeof useBing>
