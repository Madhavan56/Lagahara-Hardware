export function PagePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="container-page py-20 lg:py-28">
      <p className="text-xs font-semibold tracking-[0.2em] text-brass-600 uppercase">{phase}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-sand-900">{title}</h1>
      <p className="mt-3 max-w-lg text-sand-600">
        This section is scheduled for a later build phase. The route, layout and navigation are
        wired up and ready for it.
      </p>
    </div>
  )
}
