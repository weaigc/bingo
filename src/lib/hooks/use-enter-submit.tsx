import { useRef, type RefObject, useState } from 'react'

export function useEnterSubmit(sumbitCb: () => void): {
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  curKey: string;
} {
  const formRef = useRef<() => void>(sumbitCb)
  const [curKey, setCurKey] = useState('')

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.nativeEvent.isComposing
    ) {
      setCurKey(event.key)
      if (
        event.key === 'Enter'
      ) {
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth'
        })
        formRef.current?.()
        event.preventDefault()
      }
    }
  }

  return { onKeyDown: handleKeyDown, curKey }
}
