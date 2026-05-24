import React, { useState, useCallback, useMemo } from 'react';
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

const SECTION_LABELS: Record<string, string> = {
  I: 'Subiectul I',
  II: 'Subiectul al II-lea',
  III: 'Subiectul al III-lea',
};

const YEARS = [...new Set(ALL.map((p) => p.year))].sort();

// ─── component ───────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

type Mode = 'config' | 'test';

export default function TestGenerator({ onBack }: Props): JSX.Element {
  // Config state
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set(YEARS));
  const [counts, setCounts] = useState({ I: 6, II: 6, III: 5 });

  // Test state
  const [mode, setMode] = useState<Mode>('config');
  const [testProblems, setTestProblems] = useState<{ section: string; problems: Problem[] }[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const pool = useMemo(() => ALL.filter((p) => selectedYears.has(p.year)), [selectedYears]);

  const available = useMemo(
    () => ({
      I: pool.filter((p) => p.section === 'I').length,
      II: pool.filter((p) => p.section === 'II').length,
      III: pool.filter((p) => p.section === 'III').length,
    }),
    [pool]
  );

  const generate = useCallback(() => {
    const sections: { section: string; problems: Problem[] }[] = [];
    for (const sec of ['I', 'II', 'III'] as const) {
      const candidates = pool.filter((p) => p.section === sec);
      const picked = pick(candidates, Math.min(counts[sec], candidates.length));
      // Sortăm după prob_nr pentru afișare ordonată
      picked.sort((a, b) => a.prob_nr - b.prob_nr);
      sections.push({ section: sec, problems: picked });
    }
    setTestProblems(sections);
    setMode('test');
    setExpanded(null);
  }, [pool, counts]);

  const toggleYear = (y: number) => {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      if (next.has(y)) {
        if (next.size > 1) next.delete(y);
      } else next.add(y);
      return next;
    });
  };

  // ── config screen ──────────────────────────────────────────────────────────
  if (mode === 'config') {
    return (
      <div style={s.root}>
        <header style={s.header}>
          <button onClick={onBack} style={s.backBtn}>
            ← Înapoi
          </button>
          <span style={s.title}>🎲 Generator Test Random</span>
        </header>

        <div style={s.configBody}>
          {/* Years */}
          <section style={s.card}>
            <h3 style={s.cardTitle}>Ani de examen</h3>
            <div style={s.yearGrid}>
              {YEARS.map((y) => (
                <button
                  key={y}
                  style={{
                    ...s.yearChip,
                    ...(selectedYears.has(y) ? s.yearChipOn : s.yearChipOff),
                  }}
                  onClick={() => toggleYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </section>

          {/* Counts */}
          <section style={s.card}>
            <h3 style={s.cardTitle}>Număr de probleme per secțiune</h3>
            <div style={s.countsGrid}>
              {(['I', 'II', 'III'] as const).map((sec) => (
                <div key={sec} style={s.countRow}>
                  <span style={s.countLabel}>{SECTION_LABELS[sec]}</span>
                  <div style={s.countBtns}>
                    {[1, 2, 3, 4, 5, 6]
                      .filter((n) => sec !== 'III' || n <= 5)
                      .map((n) => (
                        <button
                          key={n}
                          style={{
                            ...s.countChip,
                            ...(counts[sec] === n ? s.countChipOn : s.countChipOff),
                          }}
                          onClick={() => setCounts((c) => ({ ...c, [sec]: n }))}
                          disabled={n > available[sec]}
                          title={n > available[sec] ? `Doar ${available[sec]} disponibile` : ''}
                        >
                          {n}
                        </button>
                      ))}
                  </div>
                  <span style={s.availLabel}>{available[sec]} disponibile</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <button style={s.generateBtn} onClick={generate}>
            🎲 Generează Test
          </button>

          <p style={s.hint}>
            Se vor alege aleator {counts.I + counts.II + counts.III} probleme din {pool.length}{' '}
            disponibile ({[...selectedYears].sort().join(', ')}).
          </p>
        </div>
      </div>
    );
  }

  // ── test screen ────────────────────────────────────────────────────────────
  const totalProblems = testProblems.reduce((s, g) => s + g.problems.length, 0);

  return (
    <div style={s.root}>
      <header style={s.header}>
        <button onClick={() => setMode('config')} style={s.backBtn}>
          ← Config
        </button>
        <span style={s.title}>Test Random · {totalProblems} probleme</span>
        <button onClick={generate} style={s.regenBtn}>
          🔀 Regenerează
        </button>
      </header>

      <div style={s.testBody}>
        {testProblems.map(({ section, problems }) => (
          <div key={section} style={s.sectionBlock}>
            <div
              style={s.sectionHeader}
              onClick={() => setExpanded(expanded === section ? null : section)}
            >
              <span style={s.sectionTitle}>{SECTION_LABELS[section]}</span>
              <span style={s.sectionMeta}>
                {problems.length} probleme · {section === 'III' ? 'open-end' : 'grilă'}
              </span>
              <span style={s.chevron}>{expanded === section ? '▲' : '▼'}</span>
            </div>

            <div style={s.problemsGrid}>
              {problems.map((prob) => (
                <ProblemCard key={prob.id} prob={prob} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ProblemCard ──────────────────────────────────────────────────────────────

function ProblemCard({ prob }: { prob: Problem }) {
  const [open, setOpen] = useState(false);

  const meta = `${prob.year} · Var. ${prob.variant} · S.${prob.section} nr.${prob.prob_nr}`;

  return (
    <div style={{ ...pc.card, ...(open ? pc.cardOpen : {}) }}>
      <button style={pc.toggle} onClick={() => setOpen((v) => !v)}>
        <span style={pc.meta}>{meta}</span>
        <span style={pc.chevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={pc.imgWrap}>
          <img src={`/problems/${prob.imgFile}`} alt={meta} style={pc.img} loading="lazy" />
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: '#0f1117',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
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
  regenBtn: {
    marginLeft: 'auto',
    background: '#3730a3',
    color: '#c7d2fe',
    border: 'none',
    borderRadius: 8,
    padding: '7px 16px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: 700,
    color: '#7c85ff',
  },
  configBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'stretch',
    maxWidth: 700,
    margin: '0 auto',
    width: '100%',
  },
  card: {
    background: '#16181f',
    borderRadius: 12,
    padding: '18px 20px',
    border: '1px solid #2d3148',
  },
  cardTitle: {
    margin: '0 0 14px',
    fontSize: 13,
    fontWeight: 700,
    color: '#7c85ff',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  yearGrid: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  yearChip: {
    padding: '6px 16px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  yearChipOn: { background: '#3730a3', color: '#c7d2fe' },
  yearChipOff: { background: '#252840', color: '#718096' },
  countsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  countRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  countLabel: {
    width: 190,
    fontSize: 13,
    color: '#a0aec0',
    flexShrink: 0,
  },
  countBtns: {
    display: 'flex',
    gap: 5,
  },
  countChip: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  countChipOn: { background: '#3730a3', color: '#c7d2fe' },
  countChipOff: { background: '#252840', color: '#718096' },
  availLabel: {
    fontSize: 11,
    color: '#4a5568',
    marginLeft: 8,
  },
  generateBtn: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 24px',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.02em',
    boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
  },
  hint: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center' as const,
    margin: 0,
  },
  testBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionBlock: {
    background: '#16181f',
    borderRadius: 12,
    border: '1px solid #2d3148',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    cursor: 'pointer',
    borderBottom: '1px solid #2d3148',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#c7d2fe',
  },
  sectionMeta: {
    fontSize: 12,
    color: '#4a5568',
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 'auto',
    color: '#4a5568',
    fontSize: 11,
  },
  problemsGrid: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
};

const pc: Record<string, React.CSSProperties> = {
  card: {
    background: '#0f1117',
    borderRadius: 8,
    border: '1px solid #2d3148',
    overflow: 'hidden',
  },
  cardOpen: {
    border: '1px solid #4f46e5',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '10px 14px',
    cursor: 'pointer',
    gap: 8,
  },
  meta: {
    flex: 1,
    textAlign: 'left' as const,
    fontSize: 13,
    color: '#a0aec0',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
  },
  chevron: {
    color: '#4a5568',
    fontSize: 10,
  },
  imgWrap: {
    padding: '0 12px 12px',
  },
  img: {
    width: '100%',
    borderRadius: 6,
    display: 'block',
    border: '1px solid #e2e8f0',
    background: '#fff',
  },
};
