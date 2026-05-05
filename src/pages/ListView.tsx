import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { Case } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ListView() {
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (!res.ok) throw new Error('Error al cargar casos');
      const data = await res.json();
      setCases(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 60000); // 60s auto refresh
    return () => clearInterval(interval);
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      c.numeroexpediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni.includes(searchTerm)
    );
  }, [cases, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'en proceso': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por expediente, nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Última Sincronización</div>
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <RefreshCw size={12} className={cn(loading && "animate-spin")} />
              {format(lastUpdated, 'HH:mm:ss')}
            </div>
          </div>
          <button 
            onClick={fetchCases}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={20} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black text-slate-800 tracking-tight">Listado Reciente</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200/50 px-2 py-1 rounded text-slate-500">
            {filteredCases.length} Resultados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 sticky top-0">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expediente</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Denunciante</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audiencia</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-mono text-sm font-black text-blue-600">{c.numeroexpediente}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">{c.id}</div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-800">
                      {c.nombre} {c.apellido}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500">
                      {c.dni}
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm",
                        getStatusColor(c.estado)
                      )}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {c.fechaAudiencia ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-lg">
                          <Clock size={12} className="text-slate-400" />
                          {format(new Date(c.fechaAudiencia), 'dd/MM HH:mm')}
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px] font-medium uppercase">Sin Fecha</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        to={`/case/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all text-[10px] font-black uppercase tracking-wider"
                      >
                        Gestionar
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-blue-500" />
                        <span className="text-slate-400 text-sm">Cargando registros...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-slate-300" />
                        <span className="text-slate-400 text-sm">No se encontraron casos que coincidan con la búsqueda.</span>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
