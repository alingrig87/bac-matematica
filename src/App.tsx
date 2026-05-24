import React, { useState } from 'react';
import CanvasBoard from './components/CanvasBoard';
import SubiectePage from './components/SubiectePage';
import TestGenerator from './components/TestGenerator';
import ProblemsReview from './components/ProblemsReview';

type Page = 'board' | 'subiecte' | 'test' | 'review';

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

  return <CanvasBoard onOpenSubiecte={() => setPage('subiecte')} />;
}
