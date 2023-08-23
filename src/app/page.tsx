import dynamic from 'next/dynamic'
import './loading.css'

const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/chat'),
  {
    ssr: false,
    loading: () => (
      <div className="loading-spinner">
        {Array.from({length: 3}).map((_, index) => <div key={index} className={`bounce${index+1}`}/>)}
      </div>
    )
  }
)

export default function IndexPage() {
  return <DynamicComponentWithNoSSR />
}
