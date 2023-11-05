import React from 'react'
import { useAtomValue } from 'jotai'
import { Throttling } from '@/lib/bots/bing/types'
import { unlimitAtom } from '@/state'

export interface TurnCounterProps {
  throttling?: Throttling
  index: number
}

export function TurnCounter({ throttling, index }: TurnCounterProps) {
  const unlimit = useAtomValue(unlimitAtom)
  if (!throttling) {
    return null
  }

  return (
    <div className="turn-counter">
      <div className="text">
        <span>{unlimit ? Math.floor(index / 2) + 1 : throttling?.numUserMessagesInConversation}</span>
        <span> 共 </span>
        <span>{unlimit ? '999' : throttling?.maxNumUserMessagesInConversation}</span>
      </div>
      <div className="indicator"></div>
    </div>
  )
}
