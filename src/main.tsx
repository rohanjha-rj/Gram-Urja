import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const fallbackVillages = [
  { name: 'Motipur', households: '1,684', load: '72,938' },
  { name: 'Oiara', households: '674', load: '29,912' },
  { name: 'Amra', households: '803', load: '35,408' },
  { name: 'Barouni', households: '300', load: '13,980' },
  { name: 'Korha', households: '170', load: '7,842' },
]

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[GramUrja] App render failed; showing static fallback.', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const pageStyle: React.CSSProperties = {
      minHeight: '100vh',
      background: '#f4f7f5',
      color: '#17231d',
      fontFamily: 'system-ui, sans-serif',
    }
    const contentStyle: React.CSSProperties = {
      width: 'min(1080px, calc(100% - 32px))',
      margin: '0 auto',
      padding: '28px 0 48px',
    }
    const panelStyle: React.CSSProperties = {
      background: '#fff',
      border: '1px solid #dce5df',
      borderRadius: 8,
      padding: 18,
    }

    return (
      <div style={pageStyle}>
        <header style={{ background: '#123c2b', color: '#fff', padding: '18px 24px' }}>
          <div style={{ ...contentStyle, padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <strong style={{ fontSize: 20 }}>GramUrja</strong>
              <div style={{ color: '#c8dfd2', fontSize: 13 }}>Village Sustainability Platform</div>
            </div>
            <span style={{ color: '#c8dfd2', fontSize: 13 }}>Static recovery view</span>
          </div>
        </header>
        <main style={contentStyle}>
          <p style={{ color: '#a34b12', fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>
            The interactive view encountered an error
          </p>
          <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Bihar village overview</h1>
          <p style={{ color: '#53645a', margin: '0 0 24px' }}>
            Showing built-in demo figures so the core platform remains available.
          </p>
          <section aria-label="Regional summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              ['Monitored villages', '5'],
              ['Households', '3,631'],
              ['Monthly electricity', '160,080 kWh'],
              ['Water benchmark', '55 L/person/day'],
            ].map(([label, value]) => (
              <div key={label} style={panelStyle}>
                <div style={{ color: '#53645a', fontSize: 13 }}>{label}</div>
                <strong style={{ display: 'block', fontSize: 21, marginTop: 8 }}>{value}</strong>
              </div>
            ))}
          </section>
          <section aria-label="Village demo data" style={{ ...panelStyle, overflowX: 'auto' }}>
            <h2 style={{ fontSize: 17, margin: '0 0 12px' }}>Village energy snapshot</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  {['Village', 'Households', 'Monthly grid load'].map((label) => (
                    <th key={label} style={{ borderBottom: '1px solid #dce5df', color: '#53645a', fontSize: 13, padding: '10px 8px' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fallbackVillages.map((village) => (
                  <tr key={village.name}>
                    <td style={{ borderBottom: '1px solid #edf1ee', padding: '11px 8px', fontWeight: 600 }}>{village.name}</td>
                    <td style={{ borderBottom: '1px solid #edf1ee', padding: '11px 8px' }}>{village.households}</td>
                    <td style={{ borderBottom: '1px solid #edf1ee', padding: '11px 8px' }}>{village.load} kWh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 18, border: 0, borderRadius: 6, background: '#176b48', color: '#fff', padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload interactive app
          </button>
        </main>
      </div>
    )
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
