import { BingWebBot } from '@/lib/bots/bing'
import { BingConversationStyle, ChatMessageModel, BotId } from '@/lib/bots/bing/types'
import { nanoid } from '@/lib/utils'
import { atom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'
import { atomWithStorage } from 'jotai/utils'
import { atomFamily } from 'jotai/utils'
import { atomWithHash, atomWithLocation } from 'jotai-location'

export const GreetMessages = [
  '谢谢你! 知道你什么时候准备好继续前进总是很有帮助的。我现在能为你回答什么问题?',
  '重新开始总是很棒。问我任何问题!',
  '当然，我很乐意重新开始。我现在可以为你提供哪些帮助?',
  '当然，我已准备好进行新的挑战。我现在可以为你做什么?',
  '很好，让我们来更改主题。你在想什么?',
  '不用担心，我很高兴尝试一些新内容。我现在可以为你回答什么问题?',
  '好的，我准备好了！感谢重置。我们应该了解哪些内容？',
  '感谢刷新！你有新的话题吗？',
  '明白了，让我们重新开始。接下来应该讨论什么？',
  '下一步！我可以为你做什么？',
  '好的，我已准备好新话题。我们应该一起了解哪些内容？'
]

export const bingConversationStyleAtom = atomWithStorage<BingConversationStyle>('bingConversationStyle', BingConversationStyle.Balanced, undefined, { unstable_getOnInit: true })
export const voiceAtom = atomWithStorage<boolean>('enableTTS', false, undefined, { unstable_getOnInit: true })

type Param = { botId: BotId; page: string }

const createBotInstance = () => {
  return new BingWebBot({
    cookie: ' ',
    ua: ' ',
  })
}

export const chatFamily = atomFamily(
  (param: Param) => {
    return atomWithImmer({
      botId: param.botId,
      bot: createBotInstance(),
      messages: [] as ChatMessageModel[],
      generatingMessageId: '',
      abortController: undefined as AbortController | undefined,
      conversationId: nanoid(),
    })
  },
  (a, b) => a.botId === b.botId && a.page === b.page,
)

export const hashAtom = atomWithHash('dialog', '')

export const locationAtom = atomWithLocation()

export const voiceListenAtom = atom(false)
