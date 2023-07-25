import { useState } from 'react'
import { useAtom } from 'jotai'
import { Switch } from '@headlessui/react'
import { toast } from 'react-hot-toast'
import { hashAtom, voiceAtom } from '@/state'
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
import { parseCookie, parseUA, randomIP } from '@/lib/utils'
import { ExternalLink } from './external-link'

export function Settings() {
  const [loc, setLoc] = useAtom(hashAtom)
  const [cookieValue, setCookieValue] = useState(parseCookie(document.cookie, 'BING_COOKIE'))
  const [ua, setUA] = useState(parseUA(parseCookie(document.cookie, 'BING_UA'), ''))
  const [enableTTS, setEnableTTS] = useAtom(voiceAtom)

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
              <div className="h-2" />
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
                  const maxAge = 86400 * 30
                  document.cookie = `BING_COOKIE=${encodeURIComponent(cookieValue)}; Max-Age=${maxAge}; path=/`
                  document.cookie = `BING_UA=${encodeURIComponent(ua!)}; Max-Age=${maxAge}; path=/`
                  document.cookie = `BING_IP=${randomIP()}; Max-Age=${maxAge}; path=/`
                } else {
                  document.cookie = `BING_COOKIE=;path=/`
                  document.cookie = `BING_UA=;path=/`
                  document.cookie = `BING_IP=;path=/`
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
  } else if (loc === 'voice') {
    return (
      <Dialog open onOpenChange={() => setLoc('')} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>语音设置</DialogTitle>
            <DialogDescription>
              目前仅支持 PC 端 Edge 及 Chrome 浏览器
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            启用语音回答
            <Switch
              checked={enableTTS}
              className={`${enableTTS ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
              onChange={(checked: boolean) => setEnableTTS(checked)}
            >
              <span
                className={`${enableTTS ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>

          <DialogFooter className="items-center">
            <Button
              variant="secondary"
              onClick={() => {
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
