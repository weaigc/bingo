import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/chat'),
  { ssr: false }
)

export default function IndexPage() {
  return (
    <>
      <div className="loading-spinner" />
      <DynamicComponentWithNoSSR />
    </>
  )
}
