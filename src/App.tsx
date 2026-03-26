/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from './store';
import PublicForm from './components/PublicForm';
import CRM from './components/CRM';
import Login from './components/Login';
import { Layout, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'public' | 'crm' | 'login'>('public');
  const store = useStore();
  const { syncError, isSyncing, refreshData } = store;

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
      {/* Sync Error Banner */}
      {syncError && view !== 'crm' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white px-4 py-2 flex items-center justify-center gap-4 shadow-lg animate-in slide-in-from-top duration-500">
          <WifiOff className="w-4 h-4" />
          <p className="text-xs font-bold tracking-wide uppercase">
            Error de conexión con la base de datos. Trabajando en modo local.
          </p>
          <button 
            onClick={() => refreshData()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
            Reintentar
          </button>
        </div>
      )}

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
