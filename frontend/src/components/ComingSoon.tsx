import './ComingSoon.css'

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="coming-soon glass reveal">
      <span className="mono">In progress</span>
      <h2>{title}</h2>
      <p>This screen is next up — the API behind it is already live, the UI just hasn&rsquo;t been built yet.</p>
    </div>
  )
}
