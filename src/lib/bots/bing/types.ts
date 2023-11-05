export type Author = 'user' | 'system' | 'bot'

export type BotId = 'bing'

export enum BingConversationStyle {
  Creative = 'Creative',
  Balanced = 'Balanced',
  Precise = 'Precise',
  Base = 'Base',
}

export enum ErrorCode {
  CONVERSATION_LIMIT = 'CONVERSATION_LIMIT',
  BING_UNAUTHORIZED = 'BING_UNAUTHORIZED',
  BING_IMAGE_UNAUTHORIZED = 'BING_IMAGE_UNAUTHORIZED',
  BING_IP_FORBIDDEN = 'BING_IP_FORBIDDEN',
  BING_TRY_LATER = 'BING_TRY_LATER',
  BING_FORBIDDEN = 'BING_FORBIDDEN',
  BING_CAPTCHA = 'BING_CAPTCHA',
  THROTTLE_LIMIT = 'THROTTLE_LIMIT',
  NOTFOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKOWN_ERROR = 'UNKOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class ChatError extends Error {
  code: ErrorCode
  constructor(message: string, code: ErrorCode) {
    super(message)
    this.code = code
  }
}

export type ChatMessageModel = {
  id: string
  author: Author
  text: string
  progress?: string[]
  error?: ChatError
  throttling?: Throttling
  sourceAttributions?: SourceAttribution[]
  suggestedResponses?: SuggestedResponse[]
}

export interface ConversationModel {
  messages: ChatMessageModel[]
}

export type Event =
  | {
      type: 'UPDATE_ANSWER'
      data: {
        text: string
        progressText?: string
        sourceAttributions?: SourceAttribution[]
        suggestedResponses?: SuggestedResponse[]
        throttling?: Throttling
      }
    }
  | {
      type: 'DONE'
    }
  | {
      type: 'ERROR'
      error: ChatError
    }

export interface SendMessageParams<T> {
  prompt: string
  context?: string
  imageUrl?: string
  options: T
  onEvent: (event: Event) => void
  signal?: AbortSignal
}

export interface ConversationResponse extends ConversationInfoBase {
  result: {
    value: string
    message?: string
  }
}

export interface Telemetry {
  metrics?: null
  startTime: string
}

export interface ChatUpdateArgument {
  messages?: ChatResponseMessage[]
  throttling?: Throttling
  requestId: string
  result: null
}

export type ChatUpdateCompleteResponse = {
  type: 2
  invocationId: string
  item: ChatResponseItem
} | {
  type: 1
  target: string
  arguments: ChatUpdateArgument[]
} | {
  type: 3
  invocationId: string
} | {
  type: 6 | 7
}

export interface ChatRequestResult {
  value: string
  serviceVersion: string
  error?: string
}

export interface ChatResponseItem {
  messages: ChatResponseMessage[]
  firstNewMessageIndex: number
  suggestedResponses: null
  conversationId: string
  requestId: string
  conversationExpiryTime: string
  telemetry: Telemetry
  result: ChatRequestResult
  throttling: Throttling
}
export enum InvocationEventType {
  Invocation = 1,
  StreamItem = 2,
  Completion = 3,
  StreamInvocation = 4,
  CancelInvocation = 5,
  Ping = 6,
  Close = 7,
}

export interface ConversationInfoBase {
  conversationId: string
  userIpAddress: string
  clientId: string
  conversationSignature?: string
  encryptedconversationsignature?: string
  invocationId: number
}

export interface ConversationInfo extends ConversationInfoBase {
  conversationStyle: BingConversationStyle
  prompt: string
  context?: string
  imageUrl?: string
  source?: 'cib' | 'WindowsCopilot'
}

export interface Throttling {
  maxNumLongDocSummaryUserMessagesInConversation: number
  maxNumUserMessagesInConversation: number
  numLongDocSummaryUserMessagesInConversation: number
  numUserMessagesInConversation: number
}

export interface ChatResponseMessage {
  text: string
  progressText?: string
  author: string
  createdAt: Date
  timestamp: Date
  messageId: string
  requestId: string
  offense: string
  adaptiveCards: AdaptiveCard[]
  sourceAttributions: SourceAttribution[]
  feedback: Feedback
  contentOrigin: string
  messageType?: string
  contentType?: string
  privacy: null
  suggestedResponses: SuggestedResponse[]
}

export interface AdaptiveCard {
  type: string
  version: string
  body: Body[]
}

export interface Body {
  type: string
  text: string
  wrap: boolean
  size?: string
}

export interface Feedback {
  tag: null
  updatedOn: null
  type: string
}

export interface SourceAttribution {
  providerDisplayName: string
  seeMoreUrl: string
  searchQuery: string
}

export interface SuggestedResponse {
  text: string
  author?: Author
  createdAt?: Date
  timestamp?: Date
  messageId?: string
  messageType?: string
  offense?: string
  feedback?: Feedback
  contentOrigin?: string
  privacy?: null
}

export interface KBlobRequest {
  knowledgeRequest: KnowledgeRequestContext
  imageBase64?: string
}

export interface KBlobResponse {
  blobId: string
  processedBlobId?: string
}

export interface KnowledgeRequestContext {
  imageInfo:        ImageInfo;
  knowledgeRequest: KnowledgeRequest;
}

export interface ImageInfo {
  url?: string;
}

export interface KnowledgeRequest {
  invokedSkills:            string[];
  subscriptionId:           string;
  invokedSkillsRequestData: InvokedSkillsRequestData;
  convoData:                ConvoData;
}

export interface ConvoData {
  convoid:   string;
  convotone: BingConversationStyle;
}

export interface InvokedSkillsRequestData {
  enableFaceBlur: boolean;
}

export interface FileItem {
  url: string;
  status?: 'loading' | 'error' | 'loaded'
}

export type Role = 'user' | 'assistant'
export type Action = 'next' | 'variant';

export interface APIMessage {
  role: Role
  content: string
}
