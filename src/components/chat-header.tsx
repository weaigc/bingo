import LogoIcon from '@/assets/images/logo.svg'
import Image from 'next/image'

export function ChatHeader() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image alt="logo" src={LogoIcon} width={60}/>
      <div className="mt-8 text-4xl font-bold">欢迎使用新必应</div>
      <div className="mt-4 mb-8 text-lg">由 AI 支持的网页版 Copilot</div>
    </div>
  )
}
