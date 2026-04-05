interface GenericToolCardProps {
  args: Record<string, unknown>
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  return JSON.stringify(value, null, 2)
}

export function GenericToolCard({ args }: GenericToolCardProps) {
  const entries = Object.entries(args)

  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">No parameters</p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <span className="font-heading text-xs font-medium uppercase text-text-tertiary">
            {key}
          </span>
          <pre className="mt-0.5 whitespace-pre-wrap break-words text-sm text-text-primary">
            {formatValue(value)}
          </pre>
        </div>
      ))}
    </div>
  )
}
