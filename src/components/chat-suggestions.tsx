import React, { useMemo } from 'react'
import Image from 'next/image'
import HelpIcon from '@/assets/images/help.svg'
import { SuggestedResponse } from '@/lib/bots/bing/types'
import { useBing } from '@/lib/hooks/use-bing'
import { atom, useAtom } from 'jotai'

type Suggestions = SuggestedResponse[]
const helpSuggestions = ['为什么不回应某些主题', '告诉我更多关于必应的资迅', '必应如何使用 AI?'].map((text) => ({ text }))
const suggestionsAtom = atom<Suggestions>([])

type ChatSuggestionsProps = React.ComponentProps<'div'> & Pick<ReturnType<typeof useBing>, 'setInput'> & { suggestions?: Suggestions }

export function ChatSuggestions({ setInput, suggestions = [] }: ChatSuggestionsProps) {
  const [currentSuggestions, setSuggestions] = useAtom(suggestionsAtom)
  const toggleSuggestions = (() => {
    if (currentSuggestions === helpSuggestions) {
      setSuggestions(suggestions)
    } else {
      setSuggestions(helpSuggestions)
    }
  })

  useMemo(() => {
    setSuggestions(suggestions)
    window.scrollBy(0, 2000)
  }, [suggestions.length, setSuggestions])

  return currentSuggestions?.length ? (
    <div className="py-6">
      <div className="suggestion-items">
        <button className="rai-button" type="button" aria-label="这是什么?" onClick={toggleSuggestions}>
          <Image alt="help" src={HelpIcon} width={24} />
        </button>
        {
          currentSuggestions.map(suggestion => (
            <button key={suggestion.text} className="body-1-strong suggestion-container" type="button" onClick={() => setInput(suggestion.text)}>
              {suggestion.text}
            </button>
          ))
        }
      </div>
    </div>
  ) : null
}
