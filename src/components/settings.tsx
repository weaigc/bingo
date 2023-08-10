import { useEffect, useState } from 'react'
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
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

export function Settings() {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [loc, setLoc] = useAtom(hashAtom)
  const [curlValue, setCurlValue] = useState(extraCurlFromCookie(parseCookies(document.cookie, ChunkKeys)))
  const [enableTTS, setEnableTTS] = useAtom(voiceAtom)

  useEffect(() => {
    if (isCopied) {
      toast.success('复制成功')
    }
  }, [isCopied])

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
              <ExternalLink href="https://www.bing.com/turing/captcha/challenge">Challenge 接口</ExternalLink>
              右键 》检查。打开开发者工具，在网络里面找到 Create 接口 》右键复制》复制为 cURL(bash)，粘贴到此处，然后保存。
              <div className="h-2" />
              图文示例：
              <ExternalLink href="https://github.com/weaigc/bingo#如何获取%20BING_HEADER">如何获取 BING_HEADER</ExternalLink>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">

          </div>
          <Input
            value={curlValue}
            placeholder="在此填写用户信息，格式: curl 'https://www.bing.com/turing/captcha/challenge' ..."
            onChange={e => setCurlValue(e.target.value)}
          />
          <Button variant="ghost" className="bg-[#F5F5F5] hover:bg-[#F2F2F2]" onClick={() => copyToClipboard(btoa(curlValue))}>
            转成 BING_HEADER 并复制
          </Button>

          <DialogFooter className="items-center">
            <Button
              variant="secondary"
              className="bg-[#c7f3ff] hover:bg-[#fdc7ff]"
              onClick={() => {
                let headerValue = curlValue
                if (headerValue) {
                  try {
                    headerValue = atob(headerValue)
                  } catch (e) {}
                  if (!/^\s*curl ['"]https:\/\/www\.bing\.com\/turing\/captcha\/challenge['"]/.test(headerValue)) {
                    toast.error('格式不正确')
                    return
                  }
                  const maxAge = 86400 * 30
                  encodeHeadersToCookie(headerValue).forEach(cookie => document.cookie = `${cookie}; Max-Age=${maxAge}; Path=/; SameSite=None; Secure`)
                } else {
                  [...ChunkKeys, 'BING_COOKIE', 'BING_UA', 'BING_IP'].forEach(key => document.cookie = `${key}=; Path=/; SameSite=None; Secure`)
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
