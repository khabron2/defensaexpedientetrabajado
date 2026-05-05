import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, FileText, Printer, ChevronRight } from 'lucide-react';
import { Case } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Hearings() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [printDate, setPrintDate] = useState<string>('');

  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => {
        const hearingsOnly = data.filter((c: Case) => c.fechaAudiencia);
        setCases(hearingsOnly);
        if (hearingsOnly.length > 0) {
          // Set default print date to the first available hearing date
          const firstDate = format(new Date(hearingsOnly[0].fechaAudiencia), 'yyyy-MM-dd');
          setPrintDate(firstDate);
        }
        setLoading(false);
      });
  }, []);

  const groupedHearings = cases.reduce((acc, c) => {
    const date = format(new Date(c.fechaAudiencia), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(c);
    return acc;
  }, {} as Record<string, Case[]>);

  const sortedDates = Object.keys(groupedHearings).sort();

  const handlePrint = () => {
    if (!printDate) {
      alert("Por favor seleccione una fecha para imprimir.");
      return;
    }
    window.print();
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando cronograma...</div>;

  const hearingsToPrint = groupedHearings[printDate] || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Print Controls - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Elegir día para imprimir</label>
          <div className="flex gap-2">
            <select 
              value={printDate}
              onChange={(e) => setPrintDate(e.target.value)}
              className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Seleccione un día...</option>
              {sortedDates.map(date => (
                <option key={date} value={date}>
                  {format(new Date(date + 'T12:00:00'), "dd/MM/yyyy", { locale: es })}
                </option>
              ))}
            </select>
            <button 
              onClick={handlePrint}
              disabled={!printDate}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Printer size={18} />
              Imprimir Listado
            </button>
          </div>
        </div>
      </div>

      {/* Main UI List - Hidden on Print if we want specifically just the selected day printed */}
      <div className="space-y-12 no-print">
        {sortedDates.map((dateStr) => {
          const dateHearings = groupedHearings[dateStr].sort((a, b) => 
            new Date(a.fechaAudiencia).getTime() - new Date(b.fechaAudiencia).getTime()
          );

          return (
            <div key={dateStr} className="space-y-6">
              <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 capitalize tracking-tighter">
                      {format(new Date(dateStr + 'T12:00:00'), "EEEE dd 'de' MMMM", { locale: es })}
                    </h3>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">
                      {dateHearings.length} Audiencias Confirmadas
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dateHearings.map((h) => (
                  <div 
                    key={h.id}
                    className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xl flex flex-col items-center min-w-[75px] shadow-inner shadow-blue-100/50">
                        <Clock size={16} className="mb-1 text-blue-400" />
                        {format(new Date(h.fechaAudiencia), "HH:mm")}
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-sm",
                        h.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>
                        {h.estado}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        Exp. {h.numeroexpediente}
                      </div>
                      <h4 className="text-xl font-black text-slate-900 leading-none mb-2">
                        {h.nombre} {h.apellido}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">
                        "{h.reclamo}"
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <User size={12} className="text-blue-500" />
                        DNI {h.dni}
                      </div>
                      <Link 
                        to={`/case/${h.id}`}
                        className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          );
        })}

        {sortedDates.length === 0 && (
          <div className="bg-white p-24 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center text-slate-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>No hay audiencias programadas en el sistema.</p>
          </div>
        )}
      </div>

      {/* Print Template - Only visible during window.print() */}
      <div className="hidden print:block p-8 font-sans text-slate-900">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Cronograma de Audiencias</h1>
            <p className="text-lg font-bold text-slate-600">
              {printDate ? format(new Date(printDate + 'T12:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : "Fecha no seleccionada"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generado el</p>
            <p className="text-xs font-bold">{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>

        {hearingsToPrint.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-4 text-xs font-black uppercase tracking-widest text-slate-500 w-24">Hora</th>
                <th className="text-left py-4 text-xs font-black uppercase tracking-widest text-slate-500">Expediente / Causa</th>
                <th className="text-left py-4 text-xs font-black uppercase tracking-widest text-slate-500">Actor / Demandado</th>
                <th className="text-left py-4 text-xs font-black uppercase tracking-widest text-slate-500">Juzgado</th>
              </tr>
            </thead>
            <tbody>
              {hearingsToPrint.sort((a, b) => new Date(a.fechaAudiencia).getTime() - new Date(b.fechaAudiencia).getTime()).map((h) => (
                <tr key={h.id} className="border-b border-slate-100">
                  <td className="py-6 text-sm font-black text-blue-600">
                    {format(new Date(h.fechaAudiencia), 'HH:mm')}
                  </td>
                  <td className="py-6">
                    <p className="text-sm font-bold text-slate-900">{h.numeroexpediente}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{h.tipo}: {h.caracteristicas}</p>
                  </td>
                  <td className="py-6">
                    <p className="text-sm font-bold text-slate-800">{h.nombre} {h.apellido}</p>
                    <p className="text-[10px] text-slate-400">DNI: {h.dni}</p>
                  </td>
                  <td className="py-6">
                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest">
                      {h.localidad}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-20 text-slate-400 italic font-medium">No hay audiencias programadas para este día.</p>
        )}

        <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center opacity-50">
          <p className="text-[10px] font-medium italic italic">Sistema de Gestión de Casos Jurídicos</p>
          <p className="text-[10px] font-medium">Firma Autorizada: ___________________________</p>
        </div>
      </div>
    </div>
  );
}
