import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { PulseLoader } from 'react-spinners'
import {Button} from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import Tabs, { Tab } from '../ui/tabs'
import { useAtom } from 'jotai';
import { localPromptsAtom, Prompt } from '@/state';

const ActionButton = (props: { text: string; onClick: () => void }) => {
  return (
    <a
      className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
      onClick={props.onClick}
    >
      {props.text}
    </a>
  )
}

const PromptItem = (props: {
  title: string
  prompt: string
  edit?: () => void
  remove?: () => void
  addToLocal?: () => void
  insertPrompt: (text: string) => void
}) => {
  const [saved, setSaved] = useState(false)

  const copyToLocal = useCallback(() => {
    props.addToLocal?.()
    setSaved(true)
  }, [props])

  return (
    <div
      className="group relative flex items-center space-x-3 rounded-lg border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400"
      onDoubleClick={() => props.insertPrompt(props.prompt)}
    >
      <div className="min-w-0 flex-1">
        <div title={props.prompt} className="truncate text-sm font-medium text-primary-text">{props.title}</div>
      </div>
      <div className="flex flex-row gap-1">
        <ActionButton text="使用" onClick={() => props.insertPrompt(props.prompt)} />
        {props.edit && <ActionButton text="编辑" onClick={props.edit} />}
        {props.addToLocal && <ActionButton text={saved ? '已添加' : '添加'} onClick={copyToLocal} />}
        {props.remove && <ActionButton text="删除" onClick={props.remove} />}
      </div>
    </div>
  )
}

function PromptForm(props: { initialData: Prompt; onSubmit: (data: Prompt) => void; onClose: () => void }) {
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const formdata = new FormData(e.currentTarget)
      const json = Object.fromEntries(formdata.entries())
      if (json.title && json.prompt) {
        props.onSubmit({
          title: json.title as string,
          prompt: json.prompt as string,
        })
      }
    },
    [props],
  )

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={onSubmit}>
      <div className="w-full">
        <span className="text-sm font-semibold block mb-1 text-primary-text">提示词标题</span>
        <Input className="w-full" name="title" defaultValue={props.initialData.title} />
      </div>
      <div className="w-full">
        <span className="text-sm font-semibold block mb-1 text-primary-text">提示词内容</span>
        <Textarea className="w-full" name="prompt" defaultValue={props.initialData.prompt} />
      </div>
      <div className="flex flex-row gap-2 mt-1">
        <Button color="primary" className="w-fit" type="submit">保存</Button>
        <Button variant="secondary" className="w-fit" onClick={props.onClose}>取消</Button>
      </div>
    </form>
  )
}

function LocalPrompts(props: { insertPrompt: (text: string) => void }) {
  const [formData, setFormData] = useState<Prompt | null>(null)
  const [localPrompts, setLocalPrompts] = useAtom(localPromptsAtom)

  const savePrompt = useCallback(
    async (prompt: Prompt) => {
      setLocalPrompts([prompt, ...localPrompts])
      setFormData(null)
    },
    [localPrompts],
  )

  const removePrompt = useCallback(
    (index: number) => {
      localPrompts.splice(index, 1)
      setLocalPrompts([...localPrompts])
    },
    [],
  )

  const create = useCallback(() => {
    setFormData({ title: '', prompt: '' })
  }, [])

  return (
    <>
      {localPrompts.length ? (
        <div className="flex flex-col gap-2 pt-2 overflow-y-auto overflow-x-clip">
          {localPrompts.map((prompt, index) => (
            <PromptItem
              key={index}
              title={prompt.title}
              prompt={prompt.prompt}
              edit={() => !formData && setFormData(prompt)}
              remove={() => removePrompt(index)}
              insertPrompt={props.insertPrompt}
            />
          ))}
        </div>
      ) : (
        <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
          你还没有提示词，请手动添加
        </div>
      )}
      <div className="mt-5">
        {formData ? (
          <PromptForm initialData={formData} onSubmit={savePrompt} onClose={() => setFormData(null)} />
        ) : (
          <Button onClick={create}>创建提示词</Button>
        )}
      </div>
    </>
  )
}

function CommunityPrompts(props: { insertPrompt: (text: string) => void }) {
  const [localPrompts, setLocalPrompts] = useAtom(localPromptsAtom)
  const [remotePrompts, setRemotePrompts] = useState<Prompt[]>([])

  useEffect(() => {
    fetch('./prompts/zh-CN.json')
    .then(res => res.json())
    .then(data => {
      setRemotePrompts(data)
    })
  }, [])

  const copyToLocal = useCallback(async (prompt: Prompt) => {
    setLocalPrompts([prompt, ...localPrompts])
  }, [localPrompts])

  return (
    <>
      <div className="flex flex-col gap-2 pt-2 overflow-y-auto">
        {remotePrompts?.length ? remotePrompts.map((prompt, index) => (
          <PromptItem
            key={index}
            title={prompt.title}
            prompt={prompt.prompt}
            insertPrompt={props.insertPrompt}
            addToLocal={() => copyToLocal(prompt)}
          />
        )) : <PulseLoader size={10} className="mt-5" color="var(--cib-color-fill-accent-gradient-primary)" />}
      </div>
      <span className="text-sm mt-5 block text-primary-text">
        提示词贡献地址：
        <a
          href="https://github.com/weaigc/bingo"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          GitHub
        </a>
      </span>
    </>
  )
}

const Prompts = (props: { insertPrompt: (text: string) => void }) => {
  const insertPrompt = useCallback(
    (text: string) => {
      props.insertPrompt(text)
    },
    [props],
  )

  const tabs = useMemo<Tab[]>(
    () => [
      { name: '我的词库', value: 'local' },
      { name: '公开词库', value: 'network' },
    ],
    [],
  )

  return (
    <Tabs
      tabs={tabs}
      renderTab={(tab: (typeof tabs)[0]['value']) => {
        if (tab === 'local') {
          return (
            <Suspense fallback={<PulseLoader size={10} className="mt-5" color="var(--cib-color-fill-accent-gradient-primary)" />}>
              <LocalPrompts insertPrompt={insertPrompt} />
            </Suspense>
          )
        }
        if (tab === 'network') {
          return (
            <Suspense fallback={<PulseLoader size={10} className="mt-5" color="var(--cib-color-fill-accent-gradient-primary)" />}>
              <CommunityPrompts insertPrompt={insertPrompt} />
            </Suspense>
          )
        }
      }}
    />
  )
}

export default Prompts
