'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { chatFamily, bingConversationStyleAtom, GreetMessages, hashAtom, voiceAtom } from '@/state'
import { setConversationMessages } from './chat-history'
import { ChatMessageModel, BotId, FileItem } from '@/lib/bots/bing/types'
import { nanoid } from '../utils'
import { TTS } from '../bots/bing/tts'

export function useBing(botId: BotId = 'bing') {
  const chatAtom = useMemo(() => chatFamily({ botId, page: 'singleton' }), [botId])
  const [enableTTS] = useAtom(voiceAtom)
  const speaker = useMemo(() => new TTS(), [])
  const [hash, setHash] = useAtom(hashAtom)
  const bingConversationStyle = useAtomValue(bingConversationStyleAtom)
  const [chatState, setChatState] = useAtom(chatAtom)
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
        imageUrl: /\?bcid=([^&]+)/.test(imageUrl ?? '') ? `https://www.bing.com/images/blob?bcid=${RegExp.$1}` : imageUrl,
        options: {
          ...options,
          bingConversationStyle,
        },
        signal: abortController.signal,
        onEvent(event) {
          if (event.type === 'UPDATE_ANSWER') {
            updateMessage(botMessageId, (message) => {
              if (event.data.text.length > message.text.length) {
                message.text = event.data.text
              }

              if (event.data.spokenText && enableTTS) {
                speaker.speak(event.data.spokenText)
              }

              message.throttling = event.data.throttling || message.throttling
              message.sourceAttributions = event.data.sourceAttributions || message.sourceAttributions
              message.suggestedResponses = event.data.suggestedResponses || message.suggestedResponses
            })
          } else if (event.type === 'ERROR') {
            updateMessage(botMessageId, (message) => {
              message.error = event.error
            })
            setChatState((draft) => {
              draft.abortController = undefined
              draft.generatingMessageId = ''
            })
          } else if (event.type === 'DONE') {
            setChatState((draft) => {
              draft.abortController = undefined
              draft.generatingMessageId = ''
            })
          }
        },
      })
    },
    [botId, attachmentList, chatState.bot, setChatState, updateMessage],
  )

  const uploadImage = useCallback(async (imgUrl: string) => {
    setAttachmentList([{ url: imgUrl, status: 'loading' }])
    const response = await chatState.bot.uploadImage(imgUrl, bingConversationStyle)
    if (response?.blobId) {
      setAttachmentList([{ url: `/api/blob?bcid=${response.blobId}`, status: 'loaded' }])
    } else {
      setAttachmentList([{ url: imgUrl, status: 'error' }])
    }
  }, [chatState.bot])

  const resetConversation = useCallback(() => {
    chatState.bot.resetConversation()
    speaker.abort()
    setChatState((draft) => {
      draft.abortController = undefined
      draft.generatingMessageId = ''
      draft.messages = [{ author: 'bot', text: GreetMessages[Math.floor(GreetMessages.length * Math.random())], id: nanoid() }]
      draft.conversationId = nanoid()
    })
  }, [chatState.bot, setChatState])

  const stopGenerating = useCallback(() => {
    chatState.abortController?.abort()
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

  useEffect(() => {
    if (chatState.messages.length) {
      setConversationMessages(botId, chatState.conversationId, chatState.messages)
    }
  }, [botId, chatState.conversationId, chatState.messages])

  useEffect(() => {
    if (hash === 'reset') {
      resetConversation()
      setHash('')
    }
  }, [hash, setHash])

  const chat = useMemo(
    () => ({
      botId,
      bot: chatState.bot,
      isSpeaking: speaker.isSpeaking,
      messages: chatState.messages,
      sendMessage,
      setInput,
      input,
      resetConversation,
      generating: !!chatState.generatingMessageId,
      stopGenerating,
      uploadImage,
      setAttachmentList,
      attachmentList,
    }),
    [
      botId,
      bingConversationStyle,
      chatState.bot,
      chatState.generatingMessageId,
      chatState.messages,
      speaker.isSpeaking,
      setInput,
      input,
      setAttachmentList,
      attachmentList,
      resetConversation,
      sendMessage,
      stopGenerating,
    ],
  )

  return chat
}
