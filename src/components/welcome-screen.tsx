import { BingReturnType } from '@/lib/hooks/use-bing'

const exampleMessages = [
  {
    heading: '🧐 提出复杂问题',
    message: `我可以为我挑剔的只吃橙色食物的孩子做什么饭?`
  },
  {
    heading: '🙌 获取更好的答案',
    message: '销量最高的 3 种宠物吸尘器有哪些优点和缺点?'
  },
  {
    heading: '🎨 获得创意灵感',
    message: `以海盗的口吻写一首关于外太空鳄鱼的俳句`
  }
]

export function WelcomeScreen({ setInput }: Pick<BingReturnType, 'setInput'>) {
  return (
    <div className="welcome-container flex">
      {exampleMessages.map(example => (
        <button key={example.heading} className="welcome-item w-4/5 sm:w-[240px]" type="button" onClick={() => setInput(example.message)}>
          <div className="item-title">{example.heading}</div>
          <div className="item-content">
            <div className="item-body">
              <div className="item-header"></div>
              <div>&ldquo;{example.message}&rdquo;</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
