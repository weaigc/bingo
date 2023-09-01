'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chatFamily, bingConversationStyleAtom, GreetMessages, hashAtom, voiceAtom, chatHistoryAtom, isImageOnly } from '@/state'
import { ChatMessageModel, BotId, FileItem } from '@/lib/bots/bing/types'
import { nanoid } from '../utils'
import { TTS } from '../bots/bing/tts'

export function useBing(botId: BotId = 'bing') {
  const chatAtom = useMemo(() => chatFamily({ botId, page: 'singleton' }), [botId])
  const [chatState, setChatState] = useAtom(chatAtom)
  const setHistoryValue = useSetAtom(chatHistoryAtom)
  const [enableTTS] = useAtom(voiceAtom)
  const speaker = useMemo(() => new TTS(), [])
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
        imageUrl: !isImageOnly && imageUrl && /api\/blob.jpg\?bcid=([^&]+)/.test(imageUrl) ? `https://www.bing.com/images/blob?bcid=${RegExp.$1}` : imageUrl,
        options: {
          ...options,
          bingConversationStyle,
          conversation: chatState.conversation,
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
            updateMessage(botMessageId, (message) => {
              message.error = event.error
            })
            setChatState((draft) => {
              draft.abortController = undefined
              draft.generatingMessageId = ''
            })
          } else if (event.type === 'DONE') {
            setChatState((draft) => {
              setHistoryValue({
                messages: draft.messages,
              })
              draft.abortController = undefined
              draft.generatingMessageId = ''
            })
          }
        },
      })
    },
    [botId, attachmentList, chatState.bot,  chatState.conversation, bingConversationStyle, speaker, setChatState, updateMessage],
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

  const resetConversation = useCallback(() => {
    chatState.bot.resetConversation()
    speaker.abort()
    setChatState((draft) => {
      draft.abortController = undefined
      draft.generatingMessageId = ''
      draft.conversation = {}
      draft.messages = [{ author: 'bot', text: GreetMessages[Math.floor(GreetMessages.length * Math.random())], id: nanoid() }]
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
    if (hash === 'reset') {
      resetConversation()
      setHash('')
    }
  }, [hash, setHash, resetConversation])

  // useEffect(() => {
  //   setChatState((draft) => {
  //     draft.abortController = undefined
  //     draft.generatingMessageId = ''
  //     draft.messages = historyValue.history || []
  //     draft.conversationId = historyValue.conversationId
  //     setTimeout(() => {
  //       window.scrollTo({
  //         top: document.body.offsetHeight,
  //         behavior: 'smooth'
  //       })
  //     }, 1000)
  //   })
  // }, [])

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

export type BingReturnType = ReturnType<typeof useBing>
