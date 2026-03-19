import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Files, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  RefreshCw,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import Dashboard from './crm/Dashboard';
import Expedientes from './crm/Expedientes';
import Audiencias from './crm/Audiencias';
import Reportes from './crm/Reportes';
import Configuracion from './crm/Configuracion';
import Notificaciones from './crm/Notificaciones';

interface CRMProps {
  onBackToPublic: () => void;
  store: any;
}

type Section = 'dashboard' | 'expedientes' | 'audiencias' | 'notificaciones' | 'reportes' | 'configuracion';

export default function CRM({ onBackToPublic, store }: CRMProps) {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const { isSyncing, lastSync, refreshData, syncError } = store;

  const handleRefresh = async () => {
    await refreshData();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'expedientes', label: 'Expedientes', icon: Files },
    { id: 'audiencias', label: 'Agenda de Audiencias', icon: Calendar },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'reportes', label: 'Reportes e Informes', icon: BarChart3 },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard store={store} />;
      case 'expedientes': return <Expedientes store={store} />;
      case 'audiencias': return <Audiencias store={store} />;
      case 'notificaciones': return <Notificaciones store={store} />;
      case 'reportes': return <Reportes store={store} />;
      case 'configuracion': return <Configuracion store={store} />;
      default: return <Dashboard store={store} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f172a] text-slate-400 flex flex-col border-r border-slate-800">
        <div className="p-8 flex items-center gap-4 border-b border-slate-800/50">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Files className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight tracking-tight">Defensa CRM</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Ventanilla Única</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                activeSection === item.id 
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" 
                  : "hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", activeSection === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
              {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-3">
          {isSyncing && (
            <div className="flex items-center gap-3 px-5 py-2 text-indigo-400 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</span>
            </div>
          )}

          <a
            href={`https://docs.google.com/spreadsheets/d/${import.meta.env.VITE_GOOGLE_SHEET_ID || '14ocpgew1-H38gckeiFP_KHbuJgOYv-fDuqvRH3yitwE'}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 group"
          >
            <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">Abrir Google Sheet</span>
          </a>

          <button
            onClick={onBackToPublic}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-300 group"
          >
            <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">Ver Formulario Público</span>
          </button>
          
          <button
            onClick={onBackToPublic}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 w-96">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar expedientes, denunciantes..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            {syncError && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <Bell className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Error de Sincronización</span>
                <button 
                  onClick={handleRefresh}
                  className="ml-2 p-1 hover:bg-rose-100 rounded transition-colors"
                  title="Reintentar sincronización"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Sincronización</p>
              <p className="text-xs font-bold text-slate-600">{lastSync ? lastSync.toLocaleTimeString() : '---'}</p>
            </div>

            <button 
              onClick={handleRefresh}
              disabled={isSyncing}
              className={cn(
                "p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all",
                isSyncing && "animate-spin text-indigo-600"
              )}
              title="Sincronizar con Google Sheets"
            >
              <RefreshCw className="w-6 h-6" />
            </button>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{store.currentUser?.username || 'Admin User'}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{store.currentUser?.role || 'Administrador'}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-200">
                <UserIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
