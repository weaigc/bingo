import { fetch, WebSocket, debug } from '@/lib/isomorphic'
import WebSocketAsPromised from 'websocket-as-promised'
import {
  SendMessageParams,
  BingConversationStyle,
  ConversationResponse,
  ChatResponseMessage,
  ConversationInfo,
  InvocationEventType,
  ChatError,
  ErrorCode,
  ChatUpdateCompleteResponse,
  ImageInfo,
  KBlobResponse,
} from './types'

import { convertMessageToMarkdown, websocketUtils, streamAsyncIterable } from './utils'
import { createChunkDecoder } from '@/lib/utils'
import { randomUUID } from 'crypto'
import md5 from 'md5'

type Params = SendMessageParams<{ bingConversationStyle: BingConversationStyle, allowSearch?: boolean, retryCount?: number }>

const getOptionSets = (conversationStyle: BingConversationStyle, allowSeach = true) => {
  const results = {
    [BingConversationStyle.Creative]: [
      'deepleo',
      'disable_emoji_spoken_text',
      'dv3sugg',
      'autosave',
      'iyxapbing',
      'iycapbing',
      'h3imaginative',
      'clgalileo',
      'gencontentv3',
    ],
    [BingConversationStyle.Balanced]: [
      'deepleo',
      'disable_emoji_spoken_text',
      'dv3sugg',
      'autosave',
      'iyxapbing',
      'iycapbing',
      'galileo',
      'saharagenconv5'
    ],
    [BingConversationStyle.Precise]: [
      'deepleo',
      'disable_emoji_spoken_text',
      'dv3sugg',
      'autosave',
      'iyxapbing',
      'iycapbing',
      'h3precise',
      'clgalileo',
      'gencontentv3',
    ],
    [BingConversationStyle.Base]: [
      'deepleo',
      'disable_emoji_spoken_text',
      'dv3sugg',
      'autosave',
      'iyxapbing',
      'iycapbing',
      'clgalileo',
      'gencontentv3',
      'nojbfedge',
    ]
  }[conversationStyle]
  if (allowSeach === false) {
    //results.push('nosearchall')
    results.push('gpt4tmncnp')
  }
  return results
}

export class BingWebBot {
  protected conversationContext?: ConversationInfo
  protected endpoint = ''
  protected cookie = ''
  private lastText = ''
  private asyncTasks: Array<Promise<any>> = []

  get isInitial() {
    return (this.conversationContext?.invocationId??0) < 1
  }

  constructor(opts: {
    endpoint?: string
    cookie?: string
  }) {
    const { endpoint, cookie } = opts
    this.endpoint = endpoint || ''
    this.cookie = cookie || ''
  }

  static buildChatRequest(conversation: ConversationInfo) {
    const uuid = randomUUID()
    const useBaseSets = (conversation.context?.length ?? 0) > 0
    const message = {
      locale: 'zh-CN',
      market: 'zh-CN',
      region: 'CN',
      locationHints: [
        {
          "SourceType": 1,
          "RegionType": 2,
          "Center": {
            "Latitude": 39.9042,
            "Longitude": 116.4074,
          },
          "Radius": 24902,
          "Name": "China",
          "Accuracy": 24902,
          "FDConfidence": 0,
          "CountryName": "China",
          "CountryConfidence": 9,
          "PopulatedPlaceConfidence": 0,
          "UtcOffset": 8,
          "Dma": 0
        }
      ],
      author: 'user',
      inputMethod: 'Keyboard',
      messageType: 'Chat',
      text: conversation.prompt,
      imageUrl: conversation.imageUrl,
      requestId: uuid,
      messageId: uuid
    }

    const argument = {
      optionsSets: getOptionSets(useBaseSets ? BingConversationStyle.Base : conversation.conversationStyle, conversation.allowSearch),
      sliceIds: [],
      message,
      source: 'cib',
      spokenTextMode: 'None',
      allowedMessageTypes: [
        "ActionRequest",
        "Chat",
        "ConfirmationCard",
        "Context",
        "InternalSearchQuery",
        "InternalSearchResult",
        "Disengaged",
        "InternalLoaderMessage",
        "Progress",
        "RenderCardRequest",
        "RenderContentRequest",
        "AdsQuery",
        "SemanticSerp",
        "GenerateContentQuery",
        "SearchQuery",
        "GeneratedCode",
        "InternalTasksMessage"
      ],
      conversationHistoryOptionsSets: [
        'autosave',
        'savemem',
        'uprofupd',
        'uprofgen'
      ],
      gptId: "copilot",
      previousMessages: conversation.context?.length ? [{
        author: 'system',
        description: conversation.context,
        contextType: 'WebPage',
        messageType: 'Context',
        messageId: 'discover-web--page-ping-mriduna-----'
      }] : undefined,
      traceId: md5(new Date().toString()),
      requestId: uuid,
      isStartOfSession: conversation.invocationId === 0,
      conversationId: conversation.conversationId,
      participant: { id: conversation.clientId },
      plugins: [],
      scenario: 'SERP',
      tone: conversation.conversationStyle
    }
    return {
      arguments: [argument],
      invocationId: `${conversation.invocationId ?? 0}`,
      target: 'chat',
      type: InvocationEventType.StreamInvocation,
    }
  }

  async createConversation(conversationId?: string): Promise<ConversationResponse> {
    const headers = {
      'Accept-Encoding': 'gzip, deflate, br, zsdch',
      'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.12.3 OS/Android',
      cookie: this.cookie,
    }

    let resp: ConversationResponse | undefined
    try {
      const search = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ''
      const response = await fetch(`${this.endpoint}/api/create${search}`, { method: 'POST', headers, mode: 'cors', credentials: 'include' })
      if (response.status === 404) {
        throw new ChatError('Not Found', ErrorCode.NOTFOUND_ERROR)
      }
      if (response.headers.has('cookie')) {
        this.cookie = response.headers.get('cookie')!
      }
      resp = await response.json() as ConversationResponse
    } catch (err) {
      console.error('create conversation error', err)
    }

    if (!resp?.result) {
      throw new ChatError('你的 VPS 或代理可能被封禁，如有疑问，请前往 https://github.com/weaigc/bingo 咨询', ErrorCode.BING_IP_FORBIDDEN)
    }

    const { value, message } = resp.result || {}
    if (value !== 'Success') {
      const errorMsg = `${value}: ${message}`
      if (value === 'UnauthorizedRequest') {
        if (/fetch failed/i.test(message || '')) {
          throw new ChatError(errorMsg, ErrorCode.BING_IP_FORBIDDEN)
        }
        throw new ChatError(errorMsg, ErrorCode.BING_UNAUTHORIZED)
      }
      if (value === 'TryLater') {
        throw new ChatError(errorMsg, ErrorCode.BING_TRY_LATER)
      }
      if (value === 'Forbidden') {
        throw new ChatError(errorMsg, ErrorCode.BING_FORBIDDEN)
      }
      throw new ChatError(errorMsg, ErrorCode.UNKOWN_ERROR)
    }
    return resp
  }

  async createContext(conversationStyle: BingConversationStyle) {
    if (!this.conversationContext) {
      const conversation = await this.createConversation()
      this.conversationContext = {
        conversationId: conversation.conversationId,
        userIpAddress: conversation.userIpAddress,
        conversationSignature: conversation.conversationSignature,
        encryptedconversationsignature: conversation.encryptedconversationsignature,
        clientId: conversation.clientId,
        invocationId: conversation.invocationId ?? 0,
        conversationStyle,
        prompt: '',
      }
    }
    return this.conversationContext
  }

  async sendMessage(params: Params) {
    try {
      await this.createContext(params.options.bingConversationStyle)
      Object.assign(this.conversationContext!, { allowSearch: params.options.allowSearch, prompt: params.prompt, imageUrl: params.imageUrl, context: params.context })
      return this.sydneyProxy(params)
    } catch (error) {
      const formatError = error instanceof ChatError ? error : new ChatError('Catch Error', ErrorCode.UNKOWN_ERROR)
      params.onEvent({
        type: 'ERROR',
        error: formatError,
      })
      throw formatError
    }
  }

  private async sydneyProxy(params: Params, reconnect: boolean = false) {
    this.lastText = ''
    const abortController = new AbortController()
    const response = await fetch(this.endpoint + '/api/sydney', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: this.cookie,
      },
      signal: abortController.signal,
      body: JSON.stringify(this.conversationContext!)
    }).catch(e => {
      console.log('Fetch Error: ', e)
      if (reconnect) return
      params.onEvent({
        type: 'ERROR',
        error: new ChatError(
          String(e),
          ErrorCode.UNKOWN_ERROR,
        ),
      })
      return e
    })
    const conversation = this.conversationContext!
    const originalInvocationId = conversation.invocationId
    conversation.invocationId++
    if (reconnect) return

    if (response.status !== 200) {
      conversation.invocationId = originalInvocationId
      params.onEvent({
        type: 'ERROR',
        error: new ChatError(
          'Network error',
          ErrorCode.UNKOWN_ERROR,
        ),
      })
    }

    params.signal?.addEventListener('abort', () => {
      abortController.abort()
      params.onEvent({
        type: 'ERROR',
        error: new ChatError(
          'Canceled',
          ErrorCode.BING_ABORT,
        ),
      })
    })

    const textDecoder = createChunkDecoder()
    const timeout = () => {
      if (params.options.retryCount??0 > 5) {
        params.onEvent({
          type: 'ERROR',
          error: new ChatError(
            'Timeout',
            ErrorCode.BING_TRY_LATER,
          ),
        })
      } else {
        conversation.invocationId = originalInvocationId
        params.options.retryCount = (params.options.retryCount ?? 0) + 1
        this.sydneyProxy(params, true)
      }
    }
    let t = conversation.invocationId ? undefined : setTimeout(timeout, 6000)
    for await (const chunk of streamAsyncIterable(response.body!)) {
      clearTimeout(t)
      t = setTimeout(timeout, 6000)
      this.parseEvents(params, websocketUtils.unpackMessage(textDecoder(chunk)))
    }
    clearTimeout(t)
  }

  async sendWs() {
    const wsConfig: ConstructorParameters<typeof WebSocketAsPromised>[1] = {
      packMessage: websocketUtils.packMessage,
      unpackMessage: websocketUtils.unpackMessage,
      createWebSocket: (url) => new WebSocket(url, {
        headers: {
          'accept-language': 'zh-CN,zh;q=0.9',
          'cache-control': 'no-cache',
          "user-agent": "Mozilla/5.0 (Linux; Android 7.1.1; OPPO R11t) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36 EdgA/108.0.1462.4",
          pragma: 'no-cache',
          cookie: this.cookie,
        }
      })
    }
    const wsp = new WebSocketAsPromised('wss://sydney.bing.com/sydney/ChatHub', wsConfig)

    wsp.open().then(() => {
      wsp.sendPacked({ protocol: 'json', version: 1 })
      wsp.sendPacked({ type: 6 })
      wsp.sendPacked(BingWebBot.buildChatRequest(this.conversationContext!))
    })

    return wsp
  }

  private async createImage(prompt: string, id: string) {
    const headers = {
      'Accept-Encoding': 'gzip, deflate, br, zsdch',
      'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.12.3 OS/Android',
      cookie: this.cookie,
    }

    const query = new URLSearchParams({
      prompt,
      id
    })
    const response = await fetch(this.endpoint + '/api/image?' + query.toString(),
      {
        method: 'POST',
        headers,
        mode: 'cors',
        credentials: 'include'
      })
      .then(async (response) => {
        if (response.status == 200) {
          return response.text();
        } else {
          throw new ChatError(String(await response.text()), ErrorCode.BING_IMAGE_UNAUTHORIZED)
        }
      })

    if (response) {
      this.lastText += '\n' + response
    }
  }

  private buildKnowledgeApiPayload(imageUrl: string, conversationStyle: BingConversationStyle) {
    const imageInfo: ImageInfo = {}
    let imageBase64: string | undefined = undefined
    const knowledgeRequest = {
      imageInfo,
      knowledgeRequest: {
        invokedSkills: [
          'ImageById'
        ],
        subscriptionId: 'Bing.Chat.Multimodal',
        invokedSkillsRequestData: {
          enableFaceBlur: true
        },
        convoData: {
          convoid: this.conversationContext?.conversationId,
          convotone: conversationStyle,
        }
      },
    }

    if (imageUrl.startsWith('data:image/')) {
      imageBase64 = imageUrl.replace('data:image/', '');
      const partIndex = imageBase64.indexOf(',')
      if (partIndex) {
        imageBase64 = imageBase64.substring(partIndex + 1)
      }
    } else {
      imageInfo.url = imageUrl
    }
    return { knowledgeRequest, imageBase64 }
  }

  async uploadImage(imageUrl: string, conversationStyle: BingConversationStyle = BingConversationStyle.Creative): Promise<KBlobResponse | undefined> {
    if (!imageUrl) {
      return
    }
    await this.createContext(conversationStyle)
    const payload = this.buildKnowledgeApiPayload(imageUrl, conversationStyle)

    const response = await fetch(this.endpoint + '/api/kblob',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      .then(res => res.json())
      .catch(e => {
        console.log('Error', e)
      })
    return response
  }

  private async generateContent(message: ChatResponseMessage) {
    if (message.contentType === 'IMAGE') {
      this.asyncTasks.push(this.createImage(message.text, message.messageId))
    }
  }

  private async parseEvents(params: Params, events: any) {
    events?.forEach(async (event: ChatUpdateCompleteResponse) => {
      // debug('bing event', JSON.stringify(event))
      if (event.type === 3) {
        await Promise.all(this.asyncTasks)
          .catch(error => {
            params.onEvent({
              type: 'ERROR',
              error: error instanceof ChatError ? error : new ChatError('Catch Error', ErrorCode.UNKOWN_ERROR),
            })
          })
        this.asyncTasks = []
        params.onEvent({ type: 'UPDATE_ANSWER', data: { text: this.lastText } })
        params.onEvent({ type: 'DONE' })
      } else if (event.type === 1) {
        const { messages, throttling } = event.arguments[0] || {}
        if (messages) {
          const message = messages[0]
          if (message.messageType === 'InternalSearchQuery' || message.messageType === 'InternalLoaderMessage') {
            return params.onEvent({ type: 'UPDATE_ANSWER', data: { text: '', progressText: message.text } })
          }
          const text = convertMessageToMarkdown(message)
          this.lastText = text
          params.onEvent({ type: 'UPDATE_ANSWER', data: { text } })
        }
        if (throttling) {
          params.onEvent({ type: 'UPDATE_ANSWER', data: { text: '', throttling } })
        }
      } else if (event.type === 2) {
        const messages = event.item.messages as ChatResponseMessage[] | undefined
        if (!messages) {
          params.onEvent({
            type: 'ERROR',
            error: new ChatError(
              event.item.result.error || 'Unknown error',
              event.item.result.value === 'Throttled' ? ErrorCode.THROTTLE_LIMIT
                : event.item.result.value === 'CaptchaChallenge' ? (this.conversationContext?.conversationId?.includes('BingProdUnAuthenticatedUsers') ? ErrorCode.BING_UNAUTHORIZED : ErrorCode.BING_CAPTCHA)
                  : ErrorCode.UNKOWN_ERROR
            ),
          })
          return
        }
        const limited = messages.some((message) =>
          message.contentOrigin === 'TurnLimiter'
          || message.messageType === 'Disengaged'
        )
        if (limited) {
          params.onEvent({
            type: 'ERROR',
            error: new ChatError(
              'Sorry, you have reached chat limit in this conversation.',
              ErrorCode.CONVERSATION_LIMIT,
            ),
          })
          return
        }

        const lastMessage = event.item.messages[event.item.messages.length - 1] as ChatResponseMessage
        const specialMessage = event.item.messages.find(message => message.author === 'bot' && message.contentType === 'IMAGE')
        if (specialMessage) {
          this.generateContent(specialMessage)
        }

        if (lastMessage) {
          const text = convertMessageToMarkdown(lastMessage)
          this.lastText = text
          params.onEvent({
            type: 'UPDATE_ANSWER',
            data: { text, throttling: event.item.throttling, suggestedResponses: lastMessage.suggestedResponses, sourceAttributions: lastMessage.sourceAttributions },
          })
        }
      }
    })
  }

  resetConversation() {
    this.conversationContext = undefined
  }
}
