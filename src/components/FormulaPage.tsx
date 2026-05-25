import React, { useState, useMemo, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FORMULA_DATA, type ClassData, type Chapter, type Formula } from '../data/formulas';

// ── KaTeX renderer ─────────────────────────────────────────────────────────────

function KTex({ latex, display = false }: { latex: string; display?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<span style="color:#e53e3e">${latex}</span>`;
    }
  }, [latex, display]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Formula card ───────────────────────────────────────────────────────────────

function FormulaCard({ f }: { f: Formula }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(f.latex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div style={fc.card}>
      <div style={fc.titleRow}>
        <span style={fc.title}>{f.title}</span>
        <button
          onClick={copy}
          title="Copiază LaTeX"
          style={{ ...fc.copyBtn, ...(copied ? fc.copyBtnDone : {}) }}
        >
          {copied ? '✓' : 'LaTeX'}
        </button>
      </div>
      <div style={{ ...fc.formula, ...(f.display ? fc.formulaDisplay : {}) }}>
        <KTex latex={f.latex} display={f.display} />
      </div>
      {f.note && <div style={fc.note}>💡 {f.note}</div>}
    </div>
  );
}

const fc: Record<string, React.CSSProperties> = {
  card: {
    background: '#1a1d2e',
    border: '1px solid #2d3148',
    borderRadius: 10,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#a5b4fc',
    lineHeight: 1.4,
    flex: 1,
  },
  copyBtn: {
    padding: '2px 8px',
    borderRadius: 5,
    border: '1px solid #3d4268',
    background: 'transparent',
    color: '#555',
    fontSize: 10,
    cursor: 'pointer',
    fontFamily: 'monospace',
    flexShrink: 0,
    transition: 'all 0.1s',
  },
  copyBtnDone: {
    borderColor: '#22c55e',
    color: '#22c55e',
  },
  formula: {
    background: '#0d0f1a',
    borderRadius: 7,
    padding: '10px 14px',
    overflowX: 'auto',
    color: '#e2e8f0',
    fontSize: 15,
  },
  formulaDisplay: {
    padding: '14px 16px',
    textAlign: 'center' as const,
    fontSize: 16,
  },
  note: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
};

// ── Chapter block ──────────────────────────────────────────────────────────────

function ChapterBlock({
  chapter,
  query,
  anchorId,
}: {
  chapter: Chapter;
  query: string;
  anchorId: string;
}) {
  const filtered = useMemo(() => {
    if (!query) return chapter.formulas;
    const q = query.toLowerCase();
    return chapter.formulas.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.latex.toLowerCase().includes(q) ||
        (f.note || '').toLowerCase().includes(q)
    );
  }, [chapter.formulas, query]);

  if (filtered.length === 0) return null;

  return (
    <section id={anchorId} style={{ marginBottom: 32 }}>
      <h3 style={s.chapterTitle}>{chapter.title}</h3>
      <div style={s.formulaGrid}>
        {filtered.map((f) => (
          <FormulaCard key={f.id} f={f} />
        ))}
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

export default function FormulaPage({ onBack }: Props): JSX.Element {
  const [activeClass, setActiveClass] = useState<'IX' | 'X' | 'XI' | 'XII'>('IX');
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const classData: ClassData = useMemo(
    () => FORMULA_DATA.find((d) => d.cls === activeClass)!,
    [activeClass]
  );

  // Count total formulas matching query
  const matchCount = useMemo(() => {
    if (!query) return null;
    const q = query.toLowerCase();
    return FORMULA_DATA.reduce(
      (acc, cd) =>
        acc +
        cd.chapters.reduce(
          (a, ch) =>
            a +
            ch.formulas.filter(
              (f) =>
                f.title.toLowerCase().includes(q) ||
                f.latex.toLowerCase().includes(q) ||
                (f.note || '').toLowerCase().includes(q)
            ).length,
          0
        ),
      0
    );
  }, [query]);

  // When searching across all classes
  const searchClasses = useMemo(() => {
    if (!query) return null;
    const q = query.toLowerCase();
    return FORMULA_DATA.map((cd) => ({
      ...cd,
      chapters: cd.chapters
        .map((ch) => ({
          ...ch,
          formulas: ch.formulas.filter(
            (f) =>
              f.title.toLowerCase().includes(q) ||
              f.latex.toLowerCase().includes(q) ||
              (f.note || '').toLowerCase().includes(q)
          ),
        }))
        .filter((ch) => ch.formulas.length > 0),
    })).filter((cd) => cd.chapters.length > 0);
  }, [query]);

  const scrollTo = (anchorId: string) => {
    document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset scroll on class change
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [activeClass]);

  const totalFormulas = FORMULA_DATA.reduce(
    (a, cd) => a + cd.chapters.reduce((b, ch) => b + ch.formulas.length, 0),
    0
  );

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <header style={s.header}>
        <button onClick={onBack} style={s.backBtn}>
          ← Înapoi
        </button>
        <span style={s.logo}>∑</span>
        <span style={s.headerTitle}>Formule matematică</span>

        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            placeholder="Caută formulă..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={s.searchInput}
          />
          {query && (
            <button onClick={() => setQuery('')} style={s.clearBtn}>
              ✕
            </button>
          )}
        </div>

        {query && matchCount !== null && <span style={s.matchBadge}>{matchCount} rezultate</span>}

        <span style={s.totalBadge}>{totalFormulas} formule</span>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={s.toggleSidebar}
          title={sidebarOpen ? 'Ascunde sidebar' : 'Arată sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </header>

      <div style={s.body}>
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside style={s.sidebar}>
            {/* Class tabs */}
            <div style={s.classTabs}>
              {FORMULA_DATA.map((cd) => (
                <button
                  key={cd.cls}
                  onClick={() => {
                    setActiveClass(cd.cls);
                    setQuery('');
                  }}
                  style={{
                    ...s.classTab,
                    ...(activeClass === cd.cls && !query ? s.classTabActive : {}),
                  }}
                >
                  <span style={s.classNum}>{cd.cls}</span>
                  <span style={s.classLabel}>cls.</span>
                </button>
              ))}
            </div>

            {/* Chapter nav */}
            <nav style={s.chapNav}>
              {!query &&
                classData.chapters.map((ch, i) => {
                  const anchorId = `chap-${classData.cls}-${i}`;
                  const count = ch.formulas.length;
                  return (
                    <button
                      key={anchorId}
                      onClick={() => scrollTo(anchorId)}
                      style={s.chapNavItem}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1e2235')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={s.chapNavTitle}>{ch.title}</span>
                      <span style={s.chapNavCount}>{count}</span>
                    </button>
                  );
                })}
              {query &&
                searchClasses &&
                searchClasses.map((cd) => (
                  <div key={cd.cls} style={{ marginBottom: 8 }}>
                    <div style={s.searchClassLabel}>{cd.label}</div>
                    {cd.chapters.map((ch, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveClass(cd.cls);
                          setTimeout(
                            () =>
                              scrollTo(
                                `chap-${cd.cls}-${FORMULA_DATA.find((d) => d.cls === cd.cls)!.chapters.findIndex((c) => c.title === ch.title)}`
                              ),
                            50
                          );
                        }}
                        style={s.chapNavItem}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1e2235')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={s.chapNavTitle}>{ch.title}</span>
                        <span style={s.chapNavCount}>{ch.formulas.length}</span>
                      </button>
                    ))}
                  </div>
                ))}
            </nav>
          </aside>
        )}

        {/* ── Content ── */}
        <main ref={contentRef} style={s.content}>
          {/* Class header */}
          {!query && (
            <div style={s.classHeader}>
              <h2 style={s.classTitle}>{classData.label}</h2>
              <span style={s.classSubtitle}>
                {classData.chapters.length} capitole ·{' '}
                {classData.chapters.reduce((a, c) => a + c.formulas.length, 0)} formule
              </span>
            </div>
          )}

          {/* Search results across all classes */}
          {query && searchClasses !== null && (
            <>
              {searchClasses.length === 0 ? (
                <div style={s.noResults}>Nicio formulă găsită pentru &bdquo;{query}&rdquo;</div>
              ) : (
                searchClasses.map((cd) =>
                  cd.chapters.map((ch) => {
                    const origIdx = FORMULA_DATA.find((d) => d.cls === cd.cls)!.chapters.findIndex(
                      (c) => c.title === ch.title
                    );
                    return (
                      <div key={`${cd.cls}-${ch.title}`}>
                        <div style={s.searchClassBadge}>
                          {cd.label} · {ch.title}
                        </div>
                        <ChapterBlock
                          chapter={ch}
                          query={query}
                          anchorId={`chap-${cd.cls}-${origIdx}`}
                        />
                      </div>
                    );
                  })
                )
              )}
            </>
          )}

          {/* Normal view by class */}
          {!query &&
            classData.chapters.map((ch, i) => (
              <ChapterBlock key={i} chapter={ch} query="" anchorId={`chap-${classData.cls}-${i}`} />
            ))}
        </main>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

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
    gap: 10,
    padding: '10px 16px',
    background: '#13151c',
    borderBottom: '1px solid #1e2236',
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },
  backBtn: {
    background: '#1e2236',
    color: '#94a3b8',
    border: 'none',
    borderRadius: 7,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  logo: {
    fontSize: 22,
    lineHeight: 1,
    color: '#818cf8',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#c7d2fe',
    marginRight: 8,
  },
  searchWrap: {
    flex: 1,
    minWidth: 180,
    maxWidth: 340,
    display: 'flex',
    alignItems: 'center',
    background: '#1a1d2e',
    borderRadius: 8,
    border: '1px solid #2d3148',
    padding: '0 10px',
    gap: 6,
  },
  searchIcon: { fontSize: 13, opacity: 0.5 },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e8f0',
    fontSize: 13,
    padding: '7px 0',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4a5568',
    cursor: 'pointer',
    fontSize: 12,
    padding: '0 2px',
  },
  matchBadge: {
    fontSize: 11,
    color: '#818cf8',
    fontWeight: 600,
    background: '#1a1d2e',
    borderRadius: 5,
    padding: '3px 8px',
    border: '1px solid #2d3148',
  },
  totalBadge: {
    fontSize: 11,
    color: '#4a5568',
    marginLeft: 'auto',
    whiteSpace: 'nowrap' as const,
  },
  toggleSidebar: {
    background: 'transparent',
    border: 'none',
    color: '#4a5568',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px 6px',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: '#0f111a',
    borderRight: '1px solid #1e2236',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  classTabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid #1e2236',
    flexShrink: 0,
  },
  classTab: {
    flex: 1,
    padding: '10px 4px',
    background: 'transparent',
    border: 'none',
    color: '#4a5568',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    transition: 'all 0.12s',
    borderBottom: '2px solid transparent',
  },
  classTabActive: {
    color: '#818cf8',
    borderBottom: '2px solid #818cf8',
    background: '#14162a',
  },
  classNum: {
    fontSize: 15,
    fontWeight: 800,
    lineHeight: 1,
  },
  classLabel: {
    fontSize: 9,
    opacity: 0.5,
    letterSpacing: '0.05em',
  },
  chapNav: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 6px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  chapNavItem: {
    width: '100%',
    textAlign: 'left' as const,
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    padding: '7px 10px',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'background 0.1s',
  },
  chapNavTitle: {
    fontSize: 12,
    lineHeight: 1.4,
    flex: 1,
  },
  chapNavCount: {
    fontSize: 10,
    color: '#334155',
    background: '#1a1d2e',
    borderRadius: 4,
    padding: '1px 5px',
    flexShrink: 0,
  },
  searchClassLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#4a5568',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    padding: '4px 10px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
  },
  classHeader: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottom: '1px solid #1e2236',
    display: 'flex',
    alignItems: 'baseline',
    gap: 14,
  },
  classTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#c7d2fe',
    margin: 0,
  },
  classSubtitle: {
    fontSize: 12,
    color: '#4a5568',
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#6366f1',
    margin: '0 0 14px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  formulaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 12,
  },
  searchClassBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4f46e5',
    background: '#1e1b4b',
    borderRadius: 5,
    padding: '3px 10px',
    display: 'inline-block',
    marginBottom: 10,
    marginTop: 8,
  },
  noResults: {
    textAlign: 'center' as const,
    color: '#4a5568',
    fontSize: 14,
    marginTop: 60,
  },
};
