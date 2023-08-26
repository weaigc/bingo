import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAtom } from 'jotai';
import { chatFamily } from '@/state';
import { convertMessageToMarkdown } from '../bots/bing/utils';
import { debug } from '../isomorphic';
import { ChatResponseMessage } from '../bots/bing/types';

export interface ChatConversation {
  chatName: string;
  conversationId: string;
  conversationSignature: string;
  plugins: string[];
  tone?: string;
  createTimeUtc: number;
  updateTimeUtc: number;
}

export interface ChatHistory {
  chats: ChatConversation[];
  clientId: string;
}

const proxyEndpoint = '/api/proxy'
const fetchProxy = (data: any, showError = true) => {
  return fetch(proxyEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(res => res.json()).catch(e => {
    if (showError) {
      toast.error('Failed to operation')
    }
    throw e
  })
}

export function useChatHistory(historyEnabled: boolean) {
  const chatAtom = useMemo(() => chatFamily({ botId: 'bing', page: 'singleton' }), ['bing'])
  const [chatState, setChatState] = useAtom(chatAtom)
  const [chatHistory, setHistory] = useState<ChatHistory>()

  const renameChat = useCallback(async (conversation: ChatConversation, chatName: string) => {
    const { conversationId, conversationSignature } = conversation

    await fetchProxy({
      url: 'https://sydney.bing.com/sydney/RenameChat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatName,
        conversationId,
        conversationSignature,
        participant: { id: chatHistory?.clientId },
        source: 'cib',
        optionsSets: ['autosave'],
      }),
    })
    refreshChats()
  }, [chatHistory])

  const deleteChat = useCallback(async (conversation: ChatConversation) => {
    const { conversationId, conversationSignature } = conversation

    await fetchProxy({
      url: 'https://sydney.bing.com/sydney/DeleteSingleConversation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        conversationSignature,
        participant: { id: chatHistory?.clientId },
        source: 'cib',
        optionsSets: ['autosave'],
      }),
    })
    refreshChats()
  }, [chatHistory])

  const downloadMessage = useCallback(async (conversation: ChatConversation) => {
    const { conversationId, conversationSignature } = conversation

    const uri = new URL('https://sydney.bing.com/sydney/GetConversation')
    uri.searchParams.append('conversationId', conversationId)
    uri.searchParams.append('conversationSignature', conversationSignature)
    uri.searchParams.append('participantId', chatHistory?.clientId || '')
    uri.searchParams.append('source', 'cib')
    const data = await fetchProxy({
      url: uri.toString(),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    const content: string = data.messages.filter((msg: ChatResponseMessage) =>
      msg.author === 'user' || msg.author === 'bot' && msg.text && !msg.messageType
    ).map((msg: ChatResponseMessage) => {
      return [
        `##${msg.author === 'user' ? '用户' : '必应'}`,
        msg.author === 'user' ? msg.text : convertMessageToMarkdown(msg)
      ].join('\n')
    }).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Conversation.txt`
    link.click()
  }, [chatHistory])

  const updateMessage = useCallback(async (conversation: ChatConversation) => {
    toast.loading('加载中', {
      duration: 0
    })
    const { conversationId, conversationSignature } = conversation

    const uri = new URL('https://sydney.bing.com/sydney/GetConversation')
    uri.searchParams.append('conversationId', conversationId)
    uri.searchParams.append('conversationSignature', conversationSignature)
    uri.searchParams.append('participantId', chatHistory?.clientId || '')
    uri.searchParams.append('source', 'cib')
    const data = await fetchProxy({
      url: uri.toString(),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
    toast.remove()
    setChatState((draft) => {
      draft.messages = data.messages.filter((msg: ChatResponseMessage) =>
        msg.author === 'user' || msg.author === 'bot' && msg.text && !msg.messageType
      ).map((msg: ChatResponseMessage) => ({ id: msg.messageId, text: msg.author === 'user' ? msg.text : convertMessageToMarkdown(msg), author: msg.author }))
      draft.conversation = {
        conversationId,
        conversationSignature,
        clientId: chatHistory?.clientId || '',
        invocationId: Math.round(draft.messages.length / 2),
      }
      debug('draft', JSON.stringify(draft))

      setTimeout(() => {
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth'
        })
      }, 500)
    })
  }, [chatHistory])

  const refreshChats = useCallback(async () => {
    const data = await fetchProxy({
      url: 'https://www.bing.com/turing/conversation/chats',
      method: 'GET',
    }, false)
    setHistory(data || {})
    return data
  }, [])

  useEffect(() => {
    if (!historyEnabled) return
    if (chatState.generatingMessageId === '' && [3, 2].includes(chatState.messages.length)) {
      debug('refresh history')
      refreshChats()
    }
  }, [historyEnabled, chatState.generatingMessageId, chatState.messages.length])

  return {
    chatHistory,
    refreshChats,
    renameChat,
    deleteChat,
    updateMessage,
    downloadMessage,
  }
}
