import React, { useState } from 'react';

interface SubiectEntry {
  id: string;
  year: number;
  variant: string;
  subiectUrl: string;
  baremUrl: string | null;
  label: string;
}

const SUBIECTE: SubiectEntry[] = [
  {
    id: '2022_var01',
    year: 2022,
    variant: 'Varianta 1',
    subiectUrl: '/subiecte/en8/2022_var01_subiect.pdf',
    baremUrl: '/subiecte/en8/2022_var01_barem.pdf',
    label: '2022 · Var. 1',
  },
  {
    id: '2022_var02',
    year: 2022,
    variant: 'Varianta 2',
    subiectUrl: '/subiecte/en8/2022_var02_subiect.pdf',
    baremUrl: '/subiecte/en8/2022_var02_barem.pdf',
    label: '2022 · Var. 2',
  },
  {
    id: '2023_var01',
    year: 2023,
    variant: 'Varianta 1',
    subiectUrl: '/subiecte/en8/2023_var01_subiect.pdf',
    baremUrl: '/subiecte/en8/2023_var01_barem.pdf',
    label: '2023 · Var. 1',
  },
  {
    id: '2023_var05',
    year: 2023,
    variant: 'Varianta 5',
    subiectUrl: '/subiecte/en8/2023_var05_subiect.pdf',
    baremUrl: '/subiecte/en8/2023_var05_barem.pdf',
    label: '2023 · Var. 5',
  },
  {
    id: '2024_var02',
    year: 2024,
    variant: 'Varianta 2',
    subiectUrl: '/subiecte/en8/2024_var02_subiect.pdf',
    baremUrl: '/subiecte/en8/2024_var02_barem.pdf',
    label: '2024 · Var. 2',
  },
  {
    id: '2024_var07',
    year: 2024,
    variant: 'Varianta 7',
    subiectUrl: '/subiecte/en8/2024_var07_subiect.pdf',
    baremUrl: '/subiecte/en8/2024_var07_barem.pdf',
    label: '2024 · Var. 7',
  },
  {
    id: '2025_model',
    year: 2025,
    variant: 'Model',
    subiectUrl: '/subiecte/en8/2025_model_subiect.pdf',
    baremUrl: '/subiecte/en8/2025_model_barem.pdf',
    label: '2025 · Model',
  },
  {
    id: '2025_simulare',
    year: 2025,
    variant: 'Simulare',
    subiectUrl: '/subiecte/en8/2025_simulare_subiect.pdf',
    baremUrl: '/subiecte/en8/2025_simulare_barem.pdf',
    label: '2025 · Simulare',
  },
  {
    id: '2025_simulare1',
    year: 2025,
    variant: 'Simulare 1',
    subiectUrl: '/subiecte/en8/2025_simulare1_subiect.pdf',
    baremUrl: '/subiecte/en8/2025_simulare1_barem.pdf',
    label: '2025 · Simulare 1',
  },
  {
    id: '2026_model',
    year: 2026,
    variant: 'Model',
    subiectUrl: '/subiecte/en8/2026_model_subiect.pdf',
    baremUrl: null,
    label: '2026 · Model',
  },
];

const YEARS = [2022, 2023, 2024, 2025, 2026];

interface Props {
  onBack: () => void;
  onOpenTest?: () => void;
  onOpenReview?: () => void;
}

export default function SubiectePage({ onBack, onOpenTest, onOpenReview }: Props): JSX.Element {
  const [selected, setSelected] = useState<SubiectEntry>(SUBIECTE[0]);
  const [viewMode, setViewMode] = useState<'subiect' | 'barem'>('subiect');

  const currentUrl =
    viewMode === 'barem' && selected.baremUrl ? selected.baremUrl : selected.subiectUrl;

  return (
    <div style={styles.root}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <button onClick={onBack} style={styles.backBtn} title="Înapoi la tablă">
            ← Tablă
          </button>
          <span style={styles.sidebarTitle}>EN VIII · Matematică</span>
          {onOpenReview && (
            <button
              onClick={onOpenReview}
              style={styles.testBtn}
              title="Review toate problemele extrase"
            >
              🔍
            </button>
          )}
          {onOpenTest && (
            <button onClick={onOpenTest} style={styles.testBtn} title="Generator test random">
              🎲
            </button>
          )}
        </div>

        <div style={styles.sidebarBody}>
          {YEARS.map((year) => {
            const items = SUBIECTE.filter((s) => s.year === year);
            if (!items.length) return null;
            return (
              <div key={year} style={styles.yearGroup}>
                <div style={styles.yearLabel}>{year}</div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    style={{
                      ...styles.itemBtn,
                      ...(selected.id === item.id ? styles.itemBtnActive : {}),
                    }}
                    onClick={() => {
                      setSelected(item);
                      setViewMode('subiect');
                    }}
                  >
                    <span style={styles.itemIcon}>📄</span>
                    <span>{item.variant}</span>
                    {!item.baremUrl && (
                      <span style={styles.noBarem} title="Fără barem">
                        ⚠
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.statsBox}>
            <div style={styles.statRow}>
              <span style={styles.statNum}>{SUBIECTE.length}</span>
              <span style={styles.statLabel}>subiecte</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statNum}>{SUBIECTE.filter((s) => s.baremUrl).length}</span>
              <span style={styles.statLabel}>bareme</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statNum}>5</span>
              <span style={styles.statLabel}>ani</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Viewer ── */}
      <main style={styles.main}>
        {/* Toolbar */}
        <div style={styles.viewerToolbar}>
          <div style={styles.viewerTitle}>
            <strong>EN VIII Matematică</strong> — {selected.label}
          </div>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(viewMode === 'subiect' ? styles.toggleBtnActive : {}),
              }}
              onClick={() => setViewMode('subiect')}
            >
              📝 Subiect
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                ...(viewMode === 'barem' ? styles.toggleBtnActive : {}),
                ...(selected.baremUrl ? {} : styles.toggleBtnDisabled),
              }}
              onClick={() => selected.baremUrl && setViewMode('barem')}
              disabled={!selected.baremUrl}
              title={selected.baremUrl ? 'Barem de corectare' : 'Barem indisponibil'}
            >
              ✅ Barem
            </button>
          </div>
          <a href={currentUrl} download style={styles.downloadBtn} title="Descarcă PDF">
            ⬇ Descarcă
          </a>
        </div>

        {/* PDF iframe */}
        <iframe
          key={currentUrl}
          src={currentUrl}
          style={styles.iframe}
          title={`${selected.label} - ${viewMode}`}
        />
      </main>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    background: '#0f1117',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#16181f',
    borderRight: '1px solid #2d3148',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '14px 12px 10px',
    borderBottom: '1px solid #2d3148',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    background: '#2d3148',
    color: '#a0aec0',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7c85ff',
    letterSpacing: '0.02em',
    lineHeight: 1.3,
  },
  sidebarBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 8px',
  },
  yearGroup: {
    marginBottom: 18,
  },
  yearLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#4a5568',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '0 6px 6px',
  },
  itemBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    padding: '7px 10px',
    cursor: 'pointer',
    color: '#a0aec0',
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  itemBtnActive: {
    background: '#252840',
    color: '#c7d2fe',
  },
  itemIcon: {
    fontSize: 14,
  },
  testBtn: {
    marginLeft: 'auto',
    background: '#3730a3',
    color: '#c7d2fe',
    border: 'none',
    borderRadius: 6,
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noBarem: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#f6ad55',
    opacity: 0.8,
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid #2d3148',
  },
  statsBox: {
    display: 'flex',
    justifyContent: 'space-around',
    background: '#0f1117',
    borderRadius: 8,
    padding: '10px 6px',
  },
  statRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  statNum: {
    fontSize: 18,
    fontWeight: 700,
    color: '#7c85ff',
  },
  statLabel: {
    fontSize: 10,
    color: '#4a5568',
    letterSpacing: '0.05em',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  viewerToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 18px',
    background: '#16181f',
    borderBottom: '1px solid #2d3148',
  },
  viewerTitle: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e0',
  },
  viewToggle: {
    display: 'flex',
    gap: 4,
    background: '#0f1117',
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    padding: '5px 14px',
    cursor: 'pointer',
    color: '#718096',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  toggleBtnActive: {
    background: '#252840',
    color: '#c7d2fe',
  },
  toggleBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  downloadBtn: {
    background: '#2d3148',
    color: '#a0aec0',
    border: 'none',
    borderRadius: 7,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  iframe: {
    flex: 1,
    border: 'none',
    background: '#fff',
  },
};
