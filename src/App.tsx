/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from './store';
import PublicForm from './components/PublicForm';
import CRM from './components/CRM';
import Login from './components/Login';
import { Layout } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'public' | 'crm' | 'login'>('public');
  const store = useStore();

  const handleOpenCRM = () => {
    if (store.currentUser) {
      setView('crm');
    } else {
      setView('login');
    }
  };

  const handleLogin = (username: string, password: string) => {
    const success = store.login(username, password);
    if (success) {
      setView('crm');
    }
    return success;
  };

  const handleLogout = () => {
    store.logout();
    setView('public');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {view === 'public' && (
        <PublicForm 
          onOpenCRM={handleOpenCRM} 
          addExpediente={store.addExpediente} 
          expedientes={store.expedientes}
        />
      )}
      
      {view === 'login' && (
        <Login onLogin={handleLogin} onBack={() => setView('public')} />
      )}

      {view === 'crm' && (
        <CRM onBackToPublic={handleLogout} store={store} />
      )}

      {/* Floating Admin Button */}
      {view === 'public' && (
        <button
          onClick={handleOpenCRM}
          className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all group z-50"
          title="Acceso Administrativo (CRM)"
        >
          <Layout className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
