import { ChatResponseMessage, BingChatResponse } from './types'

export function convertMessageToMarkdown(message: ChatResponseMessage): string {
  if (message.messageType === 'InternalSearchQuery') {
    return message.text
  }
  for (const card of message.adaptiveCards) {
    for (const block of card.body) {
      if (block.type === 'TextBlock') {
        return block.text
      }
    }
  }
  return ''
}

const RecordSeparator = String.fromCharCode(30)

export const websocketUtils = {
  packMessage(data: any) {
    return `${JSON.stringify(data)}${RecordSeparator}`
  },
  unpackMessage(data: string | ArrayBuffer | Blob) {
    if (!data) return {}
    return data
      .toString()
      .split(RecordSeparator)
      .filter(Boolean)
      .map((s) => {
        try {
          return JSON.parse(s)
        } catch (e) {
          return {}
        }
      })
  },
}

export async function* streamAsyncIterable(stream: ReadableStream) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        return
      }
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

