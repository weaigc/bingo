import { useCallback, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { Switch, RadioGroup } from '@headlessui/react'

import { Textarea } from '../ui/textarea'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PrompsTemplates, systemPromptsAtom, unlimitAtom } from '@/state'

export function AdvancedSetting() {
  const [enableUnlimit, setUnlimit] = useAtom(unlimitAtom)
  const [systemPrompt, setSystemPrompt] = useAtom(systemPromptsAtom)
  const [selected, setSelected] = useState(PrompsTemplates.find((item) => item.content === systemPrompt))

  useEffect(() => {
    if (!selected) {
      setSelected(PrompsTemplates[PrompsTemplates.length - 1])
    }
  }, [selected, systemPrompt, setSelected])
  const handleSwitchPrompt = useCallback((value: typeof PrompsTemplates[0]) => {
    setSelected(value)
    setSystemPrompt(value.content || systemPrompt)
  }, [setSelected, systemPrompt, setSystemPrompt])

  const handleChangePrompt = useCallback((value: string) => {
    setSystemPrompt(value)
  }, [])

  return (
    <>
      <DialogHeader>
        <DialogTitle>高级设置</DialogTitle>
        <DialogDescription>
          为 New Bing 添加一些实用的功能。
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        突破对话次数限制
        <Switch
          checked={enableUnlimit}
          className={`${enableUnlimit ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
          onChange={(checked: boolean) => setUnlimit(checked)}
        >
          <span
            className={`${enableUnlimit ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>
      <div className="flex flex-col gap-2">
        预设角色
        <div className="w-full py-1">
          <div className="mx-auto w-full">
            <RadioGroup value={selected} onChange={handleSwitchPrompt}>
              <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
              <div className="space-y-2">
                {PrompsTemplates.map((prompt) => (
                  <RadioGroup.Option
                    key={prompt.label}
                    value={prompt}
                    className={
                      ({ active, checked }) =>
                        `${active
                          ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-sky-300'
                          : ''}
                      ${checked ? 'bg-sky-900/75 text-white' : 'bg-white'}
                      relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                    }
                  >
                    {({ checked }) => (
                      <>
                        <div className="flex gap-2 w-full items-center justify-between">
                          <div className="flex flex-1 items-center">
                            <div className="text-sm w-full">
                              <RadioGroup.Label
                                as="p"
                                className={`font-medium ${checked ? 'text-white' : 'text-gray-900'}`}
                              >
                                {prompt.label}
                              </RadioGroup.Label>
                              <RadioGroup.Description
                                as="span"
                                className={`w-full ${checked ? 'text-sky-100' : 'text-gray-500'}`}
                              >
                                {checked && prompt.label === '自定义' ?
                                <Textarea onChange={(event) => handleChangePrompt(event.target.value)} value={systemPrompt || prompt.content} /> : <span>{prompt.desc}</span>
                                }
                              </RadioGroup.Description>
                            </div>
                          </div>
                          {checked && (
                            <div className="shrink-0 text-white">
                              <CheckIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </>
  )
}


function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
