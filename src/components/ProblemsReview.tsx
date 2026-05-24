import React, { useState } from 'react';
import problemsData from '../../public/problems/problems.json';

interface Problem {
  id: string;
  imgFile: string;
  year: number;
  variant: string;
  section: 'I' | 'II' | 'III';
  prob_nr: number;
  type: 'mc' | 'open';
}

const ALL: Problem[] = problemsData as Problem[];

const SECTION_COLORS = {
  I: { bg: '#1a2744', border: '#3b5bdb', text: '#74c0fc' },
  II: { bg: '#1a2e1a', border: '#2f9e44', text: '#69db7c' },
  III: { bg: '#2d1f0e', border: '#e67700', text: '#ffa94d' },
};

const SECTION_LABELS = { I: 'S.I', II: 'S.II', III: 'S.III' };

// Grupăm după (year, variant)
const variants = Array.from(
  new Map(ALL.map((p) => [`${p.year}_${p.variant}`, { year: p.year, variant: p.variant }])).values()
).sort((a, b) => a.year - b.year || a.variant.localeCompare(b.variant));

interface Props {
  onBack: () => void;
}

export default function ProblemsReview({ onBack }: Props): JSX.Element {
  const [filterSection, setFilterSection] = useState<'all' | 'I' | 'II' | 'III'>('all');
  const [filterVariant, setFilterVariant] = useState<string>('all');
  const [zoom, setZoom] = useState<'compact' | 'normal' | 'large'>('normal');

  const filtered = ALL.filter((p) => {
    if (filterSection !== 'all' && p.section !== filterSection) return false;
    if (filterVariant !== 'all' && `${p.year}_${p.variant}` !== filterVariant) return false;
    return true;
  });

  // Grupăm filtered după (year, variant, section)
  type Group = {
    key: string;
    year: number;
    variant: string;
    section: 'I' | 'II' | 'III';
    problems: Problem[];
  };
  const groups: Group[] = [];
  const seen = new Map<string, Group>();
  for (const p of filtered) {
    const key = `${p.year}_${p.variant}_${p.section}`;
    if (!seen.has(key)) {
      const g: Group = { key, year: p.year, variant: p.variant, section: p.section, problems: [] };
      seen.set(key, g);
      groups.push(g);
    }
    seen.get(key)!.problems.push(p);
  }

  const imgWidth = zoom === 'compact' ? 320 : zoom === 'normal' ? 520 : 760;

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <header style={s.header}>
        <button onClick={onBack} style={s.backBtn}>
          ← Înapoi
        </button>
        <span style={s.title}>🔍 Review probleme extrase</span>
        <span style={s.count}>
          {filtered.length} / {ALL.length} probleme
        </span>
      </header>

      {/* ── Filters ── */}
      <div style={s.filterBar}>
        {/* Variantă */}
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Variantă</span>
          <div style={s.chips}>
            <Chip active={filterVariant === 'all'} onClick={() => setFilterVariant('all')}>
              Toate
            </Chip>
            {variants.map((v) => (
              <Chip
                key={`${v.year}_${v.variant}`}
                active={filterVariant === `${v.year}_${v.variant}`}
                onClick={() => setFilterVariant(`${v.year}_${v.variant}`)}
              >
                {v.year} · {v.variant}
              </Chip>
            ))}
          </div>
        </div>

        {/* Secțiune */}
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Secțiune</span>
          <div style={s.chips}>
            {(['all', 'I', 'II', 'III'] as const).map((sec) => (
              <Chip key={sec} active={filterSection === sec} onClick={() => setFilterSection(sec)}>
                {sec === 'all' ? 'Toate' : `S.${sec}`}
              </Chip>
            ))}
          </div>
        </div>

        {/* Zoom */}
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Zoom</span>
          <div style={s.chips}>
            {(['compact', 'normal', 'large'] as const).map((z) => (
              <Chip key={z} active={zoom === z} onClick={() => setZoom(z)}>
                {z === 'compact' ? '🔍−' : z === 'normal' ? '🔍' : '🔍+'}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={s.body}>
        {groups.map((g) => {
          const c = SECTION_COLORS[g.section];
          return (
            <div key={g.key} style={{ ...s.group, borderColor: c.border }}>
              <div style={{ ...s.groupHeader, background: c.bg, borderBottomColor: c.border }}>
                <span style={{ ...s.groupBadge, color: c.text, borderColor: c.border }}>
                  {SECTION_LABELS[g.section]}
                </span>
                <span style={s.groupTitle}>
                  {g.year} · {g.variant}
                </span>
                <span style={s.groupCount}>{g.problems.length} probleme</span>
              </div>

              <div
                style={{
                  ...s.grid,
                  gridTemplateColumns: `repeat(auto-fill, minmax(${imgWidth}px, 1fr))`,
                }}
              >
                {g.problems.map((p) => (
                  <div key={p.id} style={s.card}>
                    <div style={s.cardHeader}>
                      <span
                        style={{
                          ...s.secBadge,
                          background: c.bg,
                          color: c.text,
                          borderColor: c.border,
                        }}
                      >
                        {SECTION_LABELS[p.section]} · #{p.prob_nr}
                      </span>
                      <span style={s.cardMeta}>
                        {p.year} · {p.variant}
                      </span>
                      <span
                        style={{
                          ...s.typeBadge,
                          background: p.type === 'mc' ? '#1a2744' : '#2d1f0e',
                        }}
                      >
                        {p.type === 'mc' ? 'grilă' : 'open'}
                      </span>
                    </div>
                    <img
                      src={`/problems/${p.imgFile}`}
                      alt={p.id}
                      style={{ ...s.img, maxWidth: imgWidth }}
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 20,
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        background: active ? '#4f46e5' : '#252840',
        color: active ? '#e0e7ff' : '#718096',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </button>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: '#0b0d14',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 18px',
    background: '#16181f',
    borderBottom: '1px solid #2d3148',
    flexShrink: 0,
  },
  backBtn: {
    background: '#2d3148',
    color: '#a0aec0',
    border: 'none',
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  title: { flex: 1, fontSize: 14, fontWeight: 700, color: '#818cf8' },
  count: { fontSize: 12, color: '#4a5568', fontVariantNumeric: 'tabular-nums' },
  filterBar: {
    padding: '10px 18px',
    background: '#13151c',
    borderBottom: '1px solid #1e2030',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4a5568',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    width: 70,
    flexShrink: 0,
  },
  chips: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  group: {
    border: '1px solid',
    borderRadius: 10,
    overflow: 'hidden',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    borderBottom: '1px solid',
  },
  groupBadge: {
    fontSize: 11,
    fontWeight: 800,
    border: '1px solid',
    borderRadius: 5,
    padding: '2px 8px',
    letterSpacing: '0.05em',
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#cbd5e0',
  },
  groupCount: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#4a5568',
  },
  grid: {
    display: 'grid',
    gap: 10,
    padding: '10px',
  },
  card: {
    background: '#16181f',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #1e2030',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderBottom: '1px solid #1e2030',
  },
  secBadge: {
    fontSize: 10,
    fontWeight: 700,
    border: '1px solid',
    borderRadius: 4,
    padding: '1px 6px',
  },
  cardMeta: { fontSize: 11, color: '#4a5568', flex: 1 },
  typeBadge: {
    fontSize: 10,
    color: '#718096',
    borderRadius: 4,
    padding: '1px 6px',
    border: '1px solid #2d3148',
  },
  img: {
    display: 'block',
    width: '100%',
    background: '#fff',
    borderTop: '1px solid #1e2030',
  },
};
