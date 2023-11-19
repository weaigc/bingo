import { Switch } from '@headlessui/react';
import { useAtom } from 'jotai';
import { gptAtom } from '@/state';

export function AdvanceSwither({ disabled }: { disabled: boolean }) {
  const [enableSydney, switchSydney] = useAtom(gptAtom)
  return (
    <div className="flex justify-center w-full pb-4">
      <div className="flex gap-2">
        <Switch
          disabled={disabled}
          checked={enableSydney}
          className={`${enableSydney ? 'bg-blue-600' : 'bg-gray-300'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} relative inline-flex h-6 w-11 items-center rounded-full`}
          onChange={(checked: boolean) => switchSydney(checked)}
        >
          <span
            className={`${enableSydney ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        启用 GPT4 模式
      </div>
    </div>
  )
}
