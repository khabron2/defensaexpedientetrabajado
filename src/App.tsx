import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import ListView from './pages/ListView';
import NewCase from './pages/NewCase';
import Stats from './pages/Stats';
import Hearings from './pages/Hearings';
import CaseDetail from './pages/CaseDetail';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('crm_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<ListView />} />
          <Route path="list" element={<ListView />} />
          <Route path="new" element={<NewCase user={user} />} />
          <Route path="stats" element={<Stats />} />
          <Route path="hearings" element={<Hearings />} />
          <Route path="case/:id" element={<CaseDetail user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
