import React from 'react'
import { BingConversationStyle } from '@/lib/bots/bing/types'
import { cn } from '@/lib/utils'

type ToneItem = {
  type: BingConversationStyle,
  name: string
}

const ToneList: ToneItem[] = [
  { name: '有创造力', type: BingConversationStyle.Creative },
  { name: '更平衡', type: BingConversationStyle.Balanced },
  { name: '更精确', type: BingConversationStyle.Precise }
]

interface ToneSelectorProps {
  type: BingConversationStyle | ''
  onChange?: (type: BingConversationStyle) => void
}

export function ToneSelector({ type, onChange }: ToneSelectorProps) {
  return (
    <div className="fieldset">
      <div className="legend">
        选择对话样式
      </div>
      <div className="options-list-container">
        <ul id="tone-options" className="options">
          {
            ToneList.map(tone => (
              <li className="option" key={tone.name} onClick={() => onChange?.(tone.type)}>
                <button className={cn(`tone-${type.toLowerCase()}`, { selected: tone.type === type}) } aria-pressed="true" >
                  <span className="caption-2-strong label-modifier">更</span>
                  <span className="body-1-strong label">{tone.name}</span>
                </button>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  )
}
