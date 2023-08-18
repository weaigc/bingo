import { ChatResponseMessage, BingChatResponse } from './types'

export function convertMessageToMarkdown(message: ChatResponseMessage): string {
  if (message.messageType === 'InternalSearchQuery') {
    return message.text
  }
  for (const card of message.adaptiveCards??[]) {
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

export async function createImage(prompt: string, id: string, headers: HeadersInit): Promise<string | undefined> {
  const { headers: responseHeaders } = await fetch(`https://www.bing.com/images/create?partner=sydney&re=1&showselective=1&sude=1&kseed=7000&SFX=&q=${encodeURIComponent(prompt)}&iframeid=${id}`,
    {
      method: 'HEAD',
      headers,
      redirect: 'manual'
    },
  );

  if (!/&id=([^&]+)$/.test(responseHeaders.get('location') || '')) {
    throw new Error('请求异常，请检查身份信息是否有效')
  }

  const resultId = RegExp.$1;
  let count = 0
  const imageThumbUrl = `https://www.bing.com/images/create/async/results/${resultId}?q=${encodeURIComponent(prompt)}&partner=sydney&showselective=1&IID=images.as`;

  do {
    await sleep(3000);
    const content = await fetch(imageThumbUrl, { headers, method: 'GET' })

    // @ts-ignore
    if (content.headers.get('content-length') > 1) {
      const text = await content.text()
        return (text?.match(/<img class="mimg"((?!src).)+src="[^"]+/mg)??[])
          .map(target => target?.split('src="').pop()?.replace(/&amp;/g, '&'))
          .map(img => `![${prompt}](${img})`).join(' ')
    }
  } while(count ++ < 10);
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

