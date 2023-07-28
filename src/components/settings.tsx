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
import { ChunkKeys, parseCookies, extraCurlFromCookie, randomIP, encodeHeadersToCookie } from '@/lib/utils'
import { ExternalLink } from './external-link'

export function Settings() {
  const [loc, setLoc] = useAtom(hashAtom)
  const [curlValue, setCurlValue] = useState(extraCurlFromCookie(parseCookies(document.cookie, ChunkKeys)))
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
              ，然后再打开
              <ExternalLink href="https://www.bing.com/turing/conversation/create">Create 接口</ExternalLink>
              右键 》检查。打开开发者工具，在网络里面找到 Create 接口 》右键复制》复制为 cURL(bash)，粘贴到此处保存。
              <div className="h-2" />
              图文示例：
              <ExternalLink href="https://github.com/weaigc/bingo#如何获取%20BING_HEADER">如何获取 BING_HEADER</ExternalLink>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={curlValue}
            placeholder="在此填写用户信息，格式: curl 'https://www.bing.com/turing/conversation/create' ..."
            onChange={e => setCurlValue(e.target.value)}
          />

          <DialogFooter className="items-center">
            <Button
              variant="secondary"
              onClick={() => {
                if (curlValue) {
                  const maxAge = 86400 * 30
                  encodeHeadersToCookie(curlValue).forEach(cookie => document.cookie = `${cookie}; Max-Age=${maxAge}; Path=/`)
                } else {
                  ChunkKeys.forEach(key => document.cookie = `${key}=; Path=/`)
                }

                toast.success('保存成功')
                setLoc('')
                setTimeout(() => {
                  location.href = './'
                }, 2000)
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
                setTimeout(() => {
                  location.href = './'
                }, 2000)
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
