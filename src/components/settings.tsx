import { useAtom } from 'jotai'
import { hashAtom } from '@/state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { parseCookie, parseUA } from '@/lib/utils'
import { ExternalLink } from './external-link'
import { useState } from 'react'

export function Settings() {
  const [loc, setLoc] = useAtom(hashAtom)
  const [cookieValue, setCookieValue] = useState(parseCookie(document.cookie, 'BING_COOKIE'))
  const [ua, setUA] = useState(parseUA(parseCookie(document.cookie, 'BING_UA'), ''))

  if (loc === 'settings') {
    return (
      <Dialog open onOpenChange={() => setLoc('')} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置你的用户信息</DialogTitle>
            <DialogDescription>
              请使用 Edge 浏览器
              <ExternalLink
                href="https://www.bing.com/turing/captcha/challenge"
              >
                打开并登录 Bing
              </ExternalLink>
              ，然后点击右键 》检查。打开开发者工具，在应用程序 》Cookie 里面找到名为 _U 的 Cookie，双击复制值，粘贴到此处保存。
              <div className="h-2"/>
              图文示例：
              <ExternalLink href="https://github.com/weaigc/bingo#%E5%A6%82%E4%BD%95%E8%8E%B7%E5%8F%96-cookie">如何获取 Cookie</ExternalLink>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={cookieValue}
            placeholder="在此填写用户信息，仅需要 _U 值"
            onChange={e => setCookieValue(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              value={ua}
              placeholder="浏览器 User Agent，需要使用 Edge 浏览器打开"
              onChange={e => setUA(e.target.value)}
            />
            <Button className="w-40" onClick={() => setUA(parseUA(navigator.userAgent))}>一键获取</Button>
          </div>

          <DialogFooter className="items-center">
            <Button
              variant="secondary"
              onClick={() => {
                if (cookieValue) {
                  document.cookie = `BING_COOKIE=${encodeURIComponent(cookieValue)};path=/`
                  document.cookie = `BING_UA=${encodeURIComponent(ua!)};path=/`
                } else {
                  document.cookie = `BING_COOKIE=;path=/`
                  document.cookie = `BING_UA=;path=/`
                }

                toast.success('保存成功')
                setLoc('')
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  return null
}
