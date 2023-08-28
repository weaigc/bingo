import { useAtomValue, useSetAtom } from "jotai"
import { hashAtom, localPromptsAtom } from "@/state"
import { Button } from "./ui/button"

interface ChatPromptsProps {
  onChange: (prompt: string) => void
  filter: string
}

export function ChatPrompts({ onChange, filter }: ChatPromptsProps) {
  const setLoc = useSetAtom(hashAtom)
  const prompts = useAtomValue(localPromptsAtom)
  const filterLower = filter.toLowerCase()
  const pormptsFiltered = filter ? prompts.filter(p => p.prompt.toLowerCase().includes(filterLower) || p.title.toLowerCase().includes(filterLower)) : prompts

  return (
    <div className="absolute top-0 w-full -ml-4">
      <div className="prompt-container absolute bottom-1 w-full">
        <div className="surface">
          {pormptsFiltered.map((prompt, index) => (
            <div className="row items-start justify-start hover:bg-gray-50" key={index} onClick={() => onChange(prompt.prompt)}>
              <div>{prompt.title}</div>
              <div className="text-sm line-clamp-2">{prompt.prompt}</div>
            </div>
          ))}
          <div onClick={() => setLoc('prompts')} className="relative cursor-pointer block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm text-primary-text">
            <Button variant="ghost">管理提示词</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
