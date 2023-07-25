'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useProxyAtom, chatFamily, bingConversationStyleAtom, GreetMessages, hashAtom, voiceAtom } from '@/state'
import { setConversationMessages } from './chat-history'
import { ChatMessageModel, BotId } from '@/lib/bots/bing/types'
import { nanoid } from '../utils'
import { TTS } from '../bots/bing/tts'

export function useBing(botId: BotId = 'bing') {
  const chatAtom = useMemo(() => chatFamily({ botId, page: 'singleton' }), [botId])
  const [enableTTS] = useAtom(voiceAtom)
  const speaker = useMemo(() => new TTS(), [])
  const [hash, setHash] = useAtom(hashAtom)
  const useProxy = useAtomValue(useProxyAtom)
  const bingConversationStyle = useAtomValue(bingConversationStyleAtom)
  const [chatState, setChatState] = useAtom(chatAtom)
  const [input, setInput] = useState('')

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
      setChatState((draft) => {
        draft.messages.push({ id: nanoid(), text: input, author: 'user' }, { id: botMessageId, text: '', author: 'bot' })
      })
      const abortController = new AbortController()
      setChatState((draft) => {
        draft.generatingMessageId = botMessageId
        draft.abortController = abortController
      })
      speaker.reset()
      await chatState.bot.sendMessage({
        prompt: input,
        options: {
          ...options,
          useProxy,
          bingConversationStyle,
        },
        signal: abortController.signal,
        onEvent(event) {
          if (event.type === 'UPDATE_ANSWER') {
            updateMessage(botMessageId, (message) => {
              if (event.data.text.length > message.text.length) {
                message.text = event.data.text
              }
              console.log('enableTTS', enableTTS)
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
    [botId, chatState.bot, setChatState, updateMessage],
  )

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
    }),
    [
      botId,
      chatState.bot,
      chatState.generatingMessageId,
      chatState.messages,
      speaker.isSpeaking,
      setInput,
      input,
      resetConversation,
      sendMessage,
      stopGenerating,
    ],
  )

  return chat
}
