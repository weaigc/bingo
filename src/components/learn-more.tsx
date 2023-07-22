import React from 'react'
import { SourceAttribution } from '@/lib/bots/bing/types'

export interface LearnMoreProps {
  sourceAttributions?: SourceAttribution[]
}

export function LearnMore({ sourceAttributions }: LearnMoreProps) {
  if (!sourceAttributions?.length) {
    return null
  }

  return (
    <div className="learn-more-root" role="list" aria-label="了解详细信息:">
      <div className="learn-more">了解详细信息:</div>
      <div className="attribution-container">
        <div className="attribution-items">
          {sourceAttributions.map((attribution, index) => {
            const { providerDisplayName, seeMoreUrl } = attribution
            const { host } = new URL(seeMoreUrl)
            return (
              <a
                key={index}
                className="attribution-item"
                target="_blank"
                role="listitem"
                href={seeMoreUrl}
                title={providerDisplayName}
                tabIndex={index}
              >
                {index + 1}. {host}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
