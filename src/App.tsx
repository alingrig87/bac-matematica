import React, { useState, Suspense, lazy } from 'react';
import CanvasBoard from './components/CanvasBoard';
import SubiectePage from './components/SubiectePage';
import TestGenerator from './components/TestGenerator';
import ProblemsReview from './components/ProblemsReview';

const FormulaPage = lazy(() => import('./components/FormulaPage'));

type Page = 'board' | 'subiecte' | 'test' | 'review' | 'formulas';

export default function App(): JSX.Element {
  const [page, setPage] = useState<Page>('board');

  if (page === 'subiecte') {
    return (
      <SubiectePage
        onBack={() => setPage('board')}
        onOpenTest={() => setPage('test')}
        onOpenReview={() => setPage('review')}
      />
    );
  }
  if (page === 'test') return <TestGenerator onBack={() => setPage('subiecte')} />;
  if (page === 'review') return <ProblemsReview onBack={() => setPage('subiecte')} />;
  if (page === 'formulas')
    return (
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: '#0b0d14',
              color: '#818cf8',
              fontSize: 16,
              gap: 12,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                border: '2px solid #818cf8',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }}
            />
            Se încarcă formulele...
          </div>
        }
      >
        <FormulaPage onBack={() => setPage('board')} />
      </Suspense>
    );

  return (
    <CanvasBoard
      onOpenSubiecte={() => setPage('subiecte')}
      onOpenFormulas={() => setPage('formulas')}
    />
  );
}
