import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import IconWarning from '@/assets/images/warning.svg'
import { ChatError, ErrorCode, ChatMessageModel } from '@/lib/bots/bing/types'
import { ExternalLink } from './external-link'

export interface ChatNotificationProps {
  message?: ChatMessageModel
}

function getAction(error: ChatError) {
  if (error.code === ErrorCode.BING_UNAUTHORIZED) {
    return (
      <ExternalLink href="https://bing.com">
        登录
      </ExternalLink>
    )
  }
  if (error.code === ErrorCode.BING_FORBIDDEN) {
    return (
      <ExternalLink href="https://bing.com/new">
        你的账号已在黑名单，请尝试更换账号及申请解封
      </ExternalLink>
    )
  }
  if (error.code === ErrorCode.BING_CAPTCHA) {
    return (
      <ExternalLink href="https://www.bing.com/turing/captcha/challenge">
        点击通过人机验证
      </ExternalLink>
    )
  }
  if (error.code === ErrorCode.COOKIE_ERROR) {
    return (
      <Link href={`#dialog="settings"`}>没有 Cookie 或 Cookie 无效，点此重新设置 Cookie</Link>
    )
  }
  return error.message
}

export function ChatNotification({ message }: ChatNotificationProps) {
  useEffect(() => {
    window.scrollBy(0, 2000)
  }, [message])

  if (!message?.error) return

  return (
    <div
      className="notification-container"
    >
      <div className="bottom-notifications">
      <div className="inline-type with-decorative-line">
        <div className="text-container">
          <div className="title inline-flex items-center">
            <Image alt="error" src={IconWarning} width={20} className="mt-1 mr-1" />
            {getAction(message.error)}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
