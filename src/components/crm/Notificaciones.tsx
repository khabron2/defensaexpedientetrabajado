import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Bell,
  Calendar,
  User as UserIcon,
  FileText,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  X
} from 'lucide-react';
import { es } from 'date-fns/locale';
import { cn, safeFormat } from '../../lib/utils';
import { Notificacion } from '../../types';

interface NotificacionesProps {
  store: any;
}

export default function Notificaciones({ store }: NotificacionesProps) {
  const { notificaciones } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotificacion, setSelectedNotificacion] = useState<Notificacion | null>(null);

  const filteredNotificaciones = notificaciones.filter((not: Notificacion) => 
    String(not.ref || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(not.dirigidoA || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(not.contra || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(not.tipo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notificaciones</h2>
          <p className="text-slate-500 text-sm font-medium">Registro de cédulas y notificaciones enviadas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por ref, destinatario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref / Año</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Ingreso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dirigido A</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contra</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notificador</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotificaciones.map((not: Notificacion) => (
                <tr key={not.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold text-indigo-600">{not.ref}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{not.anio}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{safeFormat(not.fechaIngreso, 'dd/MM/yyyy')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                      not.tipo.toLowerCase().includes('audiencia') 
                        ? "bg-amber-50 text-amber-700 border-amber-100" 
                        : "bg-indigo-50 text-indigo-700 border-indigo-100"
                    )}>
                      {not.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]" title={not.dirigidoA}>
                      {not.dirigidoA}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 truncate max-w-[150px]" title={not.contra}>
                      {not.contra}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-700">{not.notificador}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedNotificacion(not)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredNotificaciones.length === 0 && (
          <div className="py-20 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No se encontraron notificaciones</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotificacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detalle de Notificación</h3>
                  <p className="text-sm text-slate-500 font-medium">Ref: {selectedNotificacion.ref} / {selectedNotificacion.anio}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotificacion(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Ingreso</p>
                  <p className="text-sm font-bold text-slate-900">{safeFormat(selectedNotificacion.fechaIngreso, 'PPP', { locale: es })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Notificación</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {selectedNotificacion.tipo}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área / Departamento</p>
                  <p className="text-sm font-bold text-slate-900">{selectedNotificacion.area} - {selectedNotificacion.departamento}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Audiencia</p>
                  <p className="text-sm font-bold text-indigo-600">
                    {selectedNotificacion.fechaAudiencia ? safeFormat(selectedNotificacion.fechaAudiencia, 'dd/MM/yyyy') : '---'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirigido A</p>
                    <p className="text-base font-bold text-slate-900">{selectedNotificacion.dirigidoA}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contra</p>
                    <p className="text-base font-bold text-slate-900">{selectedNotificacion.contra}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Notificador</p>
                  <p className="text-sm font-bold text-indigo-900">{selectedNotificacion.notificador}</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Estado Notificación</p>
                  <p className="text-sm font-bold text-emerald-900">{selectedNotificacion.notificado}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedNotificacion(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
