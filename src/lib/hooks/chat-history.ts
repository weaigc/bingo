import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useSetAtom } from 'jotai';
import { chatHistoryAtom } from '@/state';

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
const fetchProxy = (data: any) => {
  return fetch(proxyEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(res => res.json()).catch(e => {
    toast.error('Failed to operation')
    throw e
  })
}

export function useChatHistory() {
  const [chatHistory, setHistory] = useState<ChatHistory>()
  const updateStorage = useSetAtom(chatHistoryAtom)

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

  const updateMessage = useCallback(async (conversation: ChatConversation) => {
    const { conversationId, conversationSignature } = conversation

    const uri = new URL('https://sydney.bing.com/sydney/GetConversation')
    uri.searchParams.append('conversationId', conversationId)
    uri.searchParams.append('conversationSignature', conversationSignature)
    uri.searchParams.append('participantId', chatHistory?.clientId || '')
    uri.searchParams.append('source', 'cib')
    const data = await fetchProxy({
      url: uri.toString(),
      method: 'GET',
    })
    console.log('data', data)
    updateStorage(data)
  }, [chatHistory])

  const refreshChats = useCallback(async () => {
    const data = await fetchProxy({
      url: 'https://www.bing.com/turing/conversation/chats',
      method: 'GET',
    })
    setHistory(data || {})
  }, [])

  return {
    chatHistory,
    refreshChats,
    renameChat,
    deleteChat,
    updateMessage,
  }
}
