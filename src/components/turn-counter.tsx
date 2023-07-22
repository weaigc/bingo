import React from 'react'
import { Throttling } from '@/lib/bots/bing/types'

export interface TurnCounterProps {
  throttling?: Throttling
}

export function TurnCounter({ throttling }: TurnCounterProps) {
  if (!throttling) {
    return null
  }

  return (
    <div className="turn-counter">
      <div className="text">
        <span>{throttling.numUserMessagesInConversation}</span>
        <span> 共 </span>
        <span>{throttling.maxNumUserMessagesInConversation}</span>
      </div>
      <div className="indicator"></div>
    </div>
  )
}
