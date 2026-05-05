import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  Calendar, 
  LogOut, 
  Database,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Lista de Casos', path: '/list' },
    { icon: PlusCircle, label: 'Nuevo Caso', path: '/new' },
    { icon: BarChart3, label: 'Estadísticas', path: '/stats' },
    { icon: Calendar, label: 'Audiencias', path: '/hearings' },
  ];

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1BycesOEPZputcAAAFoA2-kCCd5QPgUSeQSQdW_YItEM/edit";

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col border-r border-slate-800 shadow-xl md:relative md:translate-x-0"
          >
            <div className="flex flex-col h-full">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
                    CM
                  </div>
                  <span className="text-white font-bold text-lg tracking-tight">CaseMaster</span>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden ml-auto p-1 text-slate-400 hover:bg-slate-800 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                        location.pathname === item.path || (item.path === '/list' && location.pathname === '/')
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <item.icon size={18} className={cn(
                        location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      )} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="mt-auto p-6 border-t border-slate-800 space-y-4">
                <a 
                  href={SHEET_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                >
                  <Database size={16} />
                  <span>Abrir Google Sheet</span>
                </a>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                    {user.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Activo</p>
                    <p className="text-sm text-white font-semibold truncate leading-tight">{user.nombre}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={cn("p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 transition-all", isSidebarOpen && "hidden")}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {navItems.find(i => i.path === location.pathname)?.label || 'Detalles del Caso'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">Sistema de Gestión Institucional</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 text-xs font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En Línea
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
