import { useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { useBoard } from './hooks/useBoard';
import { ModalProvider } from './components/ModalContext';
import AuthPage from './components/AuthPage';
import Overview from './pages/Overview';
import BoardView from './pages/BoardView';
import { WeekDetail, WeeksList } from './pages/WeeksView';
import { PhaseDetail, PhasesList } from './pages/PhasesView';
import { sprintsSorted } from './lib/board-utils';
import type { BoardData } from './api/board';

const NAV = [
  { to: '/', label: 'Overview', icon: '◎', end: true },
  { to: '/board', label: 'Board', icon: '▥', end: false },
  { to: '/weeks', label: 'Weeks', icon: '🗓', end: false },
  { to: '/phases', label: 'Phases', icon: '◆', end: false },
];

function titleFor(path: string, board: BoardData): { title: string; sub: string } {
  if (path === '/') return { title: 'Overview', sub: 'Your prep at a glance' };
  if (path.startsWith('/board')) return { title: 'Sprint Board', sub: 'Drag tickets across statuses' };
  if (path.startsWith('/weeks')) return { title: 'Weeks', sub: 'Sprints, one per week' };
  if (path.startsWith('/week/')) {
    const id = path.split('/week/')[1];
    const s = board.sprints.find((x) => x.id === id);
    return { title: s?.title ?? 'Week', sub: 'Tickets grouped by day' };
  }
  if (path === '/phases') return { title: 'Phases', sub: 'The 3 phases of your plan' };
  if (path.startsWith('/phase/')) {
    const id = path.split('/phase/')[1];
    const p = board.phases.find((x) => x.id === id);
    return { title: p?.short ?? 'Phase', sub: p?.name ?? '' };
  }
  return { title: 'Prep Tracker', sub: '' };
}

function Shell({ board }: { board: BoardData }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { title, sub } = titleFor(location.pathname, board);

  return (
    <ModalProvider sprints={sprintsSorted(board)}>
      <div className="app-shell">
        {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
        <aside className={`sidebar${navOpen ? ' open' : ''}`}>
          <div className="brand">
            <img className="logo" src="/favicon.svg" alt="" />
            <div>
              <h1>Prep Tracker</h1>
              <p>12-week interview prep</p>
            </div>
          </div>

          <div className="nav-section">Views</div>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setNavOpen(false)}
            >
              <span className="ico">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}

          <div className="sidebar-spacer" />
          <div className="nav-section">Account</div>
          <div className="nav-item" style={{ cursor: 'default', fontSize: 12.5, color: 'var(--text-3)' }}>
            <span className="ico">👤</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
          </div>
          <button className="nav-item" onClick={signOut}>
            <span className="ico">⎋</span>
            Sign out
          </button>
        </aside>

        <div className="main">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setNavOpen(true)} aria-label="Menu">
              ☰
            </button>
            <div>
              <h2>{title}</h2>
              <div className="sub">{sub}</div>
            </div>
            <div className="topbar-grow" />
          </header>
          <main className="content">
            <Routes>
              <Route path="/" element={<Overview board={board} />} />
              <Route path="/board" element={<BoardView board={board} />} />
              <Route path="/weeks" element={<WeeksList board={board} />} />
              <Route path="/week/:sprintId" element={<WeekDetail board={board} />} />
              <Route path="/phases" element={<PhasesList board={board} />} />
              <Route path="/phase/:phaseId" element={<PhaseDetail board={board} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ModalProvider>
  );
}

export default function App() {
  const { session, loading } = useAuth();
  const board = useBoard();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return <AuthPage />;

  if (board.isLoading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-2)' }}>Loading your board…</p>
      </div>
    );
  }

  if (board.isError || !board.data) {
    return (
      <div className="center-screen">
        <div className="empty">
          <div className="big">⚠️</div>
          <p>Couldn't load your board.</p>
          <p style={{ color: 'var(--text-3)', fontSize: 13, maxWidth: 360 }}>
            {board.error instanceof Error ? board.error.message : 'Unknown error.'}
            <br />
            Make sure the database schema has been applied in Supabase.
          </p>
          <button className="btn btn-primary" onClick={() => board.refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <Shell board={board.data} />;
}
