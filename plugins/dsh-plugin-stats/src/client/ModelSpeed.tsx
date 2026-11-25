import { SPEED_WINDOWS, SpeedSummarySchema, type SpeedRow, type SpeedSummary, type SpeedWindow } from '../core/request-speed.js'
import { formatMs, formatTps } from './data.js'
import type { DictKey, Translate } from './i18n.js'
import type { ReactNode, ReactRuntime } from './react.js'

type Metric = 'ttftMs' | 'generationTps' | 'endToEndTps'
const METRICS: readonly [Metric, DictKey][] = [
  ['ttftMs', 'speedTtft'], ['generationTps', 'speedGeneration'], ['endToEndTps', 'speedEndToEnd'],
]
const numberText = (value: number | null): string => value === null ? '—' : value.toLocaleString()
const rateText = (value: number | null): string => value === null ? '—' : `${formatTps(value)} tok/s`

export function ModelSpeed({ React, t, url, refresh }: {
  React: ReactRuntime; t: Translate; url: string | undefined; refresh: number
}): ReactNode {
  const [hours, setHours] = React.useState<SpeedWindow>(24)
  const [sort, setSort] = React.useState<{ key: Metric; ascending: boolean }>({ key: 'endToEndTps', ascending: false })
  const [state, setState] = React.useState<{
    hours: SpeedWindow; refresh: number; summary: SpeedSummary | null; failed: boolean
  } | null>(null)

  React.useEffect(() => {
    if (url === undefined) return
    const controller = new AbortController()
    const endpoint = new URL(url, window.location.href)
    endpoint.searchParams.set('hours', String(hours))
    void fetch(endpoint, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return SpeedSummarySchema.parse(await response.json())
      })
      .then((summary) => {
        if (!controller.signal.aborted) setState({ hours, refresh, summary, failed: false })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ hours, refresh, summary: null, failed: true })
      })
    return () => controller.abort()
  }, [url, hours, refresh])

  const active = state?.hours === hours && state.refresh === refresh ? state : null
  const rows = [...(active?.summary?.rows ?? [])].sort((a, b) => compare(a, b, sort))
  const visibleStatus = url === undefined ? 'reload' : active === null ? 'loading' : active.failed ? 'speedError' : rows.length === 0 ? 'speedEmpty' : null
  const asOf = active?.summary?.asOf

  return (
    <section className="tps-speed" aria-label={t('speedTitle')}>
      <div className="tps-speed-head">
        <h3>{t('speedTitle')}</h3>
        <div role="group" aria-label={t('speedRange')} className="tps-speed-windows">
          {SPEED_WINDOWS.map((window) => (
            <button key={window} type="button" aria-pressed={window === hours} onClick={() => setHours(window)}>
              {t('speedWindow', { hours: window })}
            </button>
          ))}
        </div>
      </div>
      <p className="tps-hint">{t('speedHint')}</p>
      {visibleStatus !== null && <p className="tps-note" role="status">{t(visibleStatus)}</p>}
      {rows.length > 0 && (
        <div className="tps-speed-scroll">
          <table className="tps-table tps-speed-table" aria-label={t('speedTitle')}>
            <thead>
              <tr>
                <th scope="col">{t('speedModel')}</th>
                {METRICS.map(([key, label]) => (
                  <th key={key} scope="col" aria-sort={sort.key === key ? (sort.ascending ? 'ascending' : 'descending') : undefined}>
                    <button type="button" onClick={() => setSort((old) => ({ key, ascending: old.key === key ? !old.ascending : key === 'ttftMs' }))}>
                      {t(label)} <span aria-hidden="true">{sort.key === key ? (sort.ascending ? '↑' : '↓') : '↕'}</span>
                    </button>
                  </th>
                ))}
                <th scope="col">{t('speedRequests')}</th>
                <th scope="col">{t('speedOutput')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={JSON.stringify([row.provider, row.model])}>
                  <td><strong>{row.model}</strong><small>{row.provider}</small></td>
                  <td>{formatMs(row.ttftMs)}<small>{t('speedSamples', { n: row.ttftSamples })}</small></td>
                  <td>{rateText(row.generationTps)}<small>{t('speedSamples', { n: row.generationSamples })}</small></td>
                  <td>{rateText(row.endToEndTps)}<small>{t('speedSamples', { n: row.tpsSamples })}</small></td>
                  <td>{numberText(row.requests)}</td>
                  <td>{numberText(row.outputTokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {asOf !== undefined && <p className="tps-hint">{t('speedAsOf', { time: new Date(asOf).toLocaleString() })}</p>}
    </section>
  )
}

function compare(a: SpeedRow, b: SpeedRow, { key, ascending }: { key: Metric; ascending: boolean }): number {
  const x = a[key]
  const y = b[key]
  if (x !== null && y === null) return -1
  if (x === null && y !== null) return 1
  return (x !== null && y !== null ? (ascending ? x - y : y - x) : 0)
    || b.requests - a.requests || a.model.localeCompare(b.model) || a.provider.localeCompare(b.provider)
}
