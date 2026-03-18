import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Printer, 
  Search,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { addDays, startOfToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, safeFormat } from '../../lib/utils';
import { HORARIOS_AUDIENCIA } from '../../constants';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AudienciasProps {
  store: any;
}

export default function Audiencias({ store }: AudienciasProps) {
  const { audiencias, expedientes, addAudiencia } = store;
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [isAdding, setIsAdding] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [dateToPrint, setDateToPrint] = useState(safeFormat(new Date(), 'yyyy-MM-dd'));
  const [expedienteSearch, setExpedienteSearch] = useState('');
  const [newAudiencia, setNewAudiencia] = useState({
    expedienteId: '',
    hora: '08:00' as any,
    espacio: 1 as 1 | 2,
  });

  const filteredExpedientesForSelect = (expedientes || []).filter((exp: any) => 
    String(exp.numero).toLowerCase().includes(expedienteSearch.toLowerCase()) ||
    String(exp.denunciante?.nombre || '').toLowerCase().includes(expedienteSearch.toLowerCase()) ||
    String(exp.denunciante?.dni || '').includes(expedienteSearch)
  );

  const filteredAudiencias = audiencias.filter((a: any) => {
    // a.fecha is stored as YYYY-MM-DD
    const selectedDateStr = safeFormat(selectedDate, 'yyyy-MM-dd');
    return a.fecha === selectedDateStr;
  });

  const handleAdd = () => {
    const exp = expedientes.find((e: any) => e.id === newAudiencia.expedienteId);
    if (exp) {
      addAudiencia({
        expedienteId: exp.id,
        fecha: selectedDate.toISOString(),
        hora: newAudiencia.hora,
        espacio: newAudiencia.espacio,
        denunciante: exp.denunciante.nombre,
        denunciado: exp.empresas[0].nombre,
      });
      handleCloseAdding();
      setNewAudiencia({ expedienteId: '', hora: '08:00', espacio: 1 });
    }
  };

  const printDailySchedule = (date: Date) => {
    const doc = new jsPDF();
    const dateStr = safeFormat(date, "dd/MM/yyyy");
    
    const targetDateStr = safeFormat(date, 'yyyy-MM-dd');
    const printAudiencias = audiencias.filter((a: any) => a.fecha === targetDateStr);

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DEFENSA DEL CONSUMIDOR", 105, 15, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Agenda de Audiencias - ${dateStr}`, 105, 25, { align: "center" });
    
    if (printAudiencias.length === 0) {
      doc.setFontSize(12);
      doc.text("No hay audiencias programadas para este día.", 14, 40);
    } else {
      const tableData = printAudiencias
        .sort((a: any, b: any) => {
          const timeCompare = a.hora.localeCompare(b.hora);
          if (timeCompare !== 0) return timeCompare;
          return a.espacio - b.espacio;
        })
        .map((a: any) => {
          const exp = expedientes.find((e: any) => e.id === a.expedienteId);
          return [a.hora, a.espacio, exp?.numero || '-', a.denunciante, a.denunciado];
        });

      autoTable(doc, {
        startY: 35,
        head: [['Hora', 'Esp.', 'Expediente', 'Denunciante', 'Denunciado']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 15 },
        }
      });
    }

    doc.save(`audiencias_${dateStr.replace(/\//g, '-')}.pdf`);
    setIsPrinting(false);
  };

  const handleCloseAdding = () => {
    setIsAdding(false);
    setExpedienteSearch('');
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agenda de Audiencias</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setDateToPrint(safeFormat(selectedDate, 'yyyy-MM-dd'));
              setIsPrinting(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Día
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Programar Audiencia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Calendar Picker */}
        <div className="bg-slate-100/50 p-8 rounded-[2.5rem] border border-slate-200/60 h-fit">
          <div className="flex flex-col gap-6 mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Seleccionar Fecha</h3>
            <div className="relative">
              <input 
                type="date" 
                value={safeFormat(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value + 'T12:00:00');
                  if (!isNaN(newDate.getTime())) {
                    setSelectedDate(newDate);
                  }
                }}
                className="w-full text-sm font-bold text-indigo-600 bg-white px-4 py-3 rounded-2xl outline-none border border-slate-200 cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
              const date = addDays(startOfToday(), offset);
              const isActive = isSameDay(date, selectedDate);
              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-white text-indigo-700 shadow-lg shadow-indigo-500/5 border border-indigo-100" 
                      : "hover:bg-white/60 text-slate-500"
                  )}
                >
                  <div className="text-left">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.15em] mb-1 transition-colors",
                      isActive ? "text-indigo-400" : "text-slate-400"
                    )}>
                      {safeFormat(date, 'EEE', { locale: es })}
                    </p>
                    <p className="font-black text-sm">{safeFormat(date, 'd MMM', { locale: es })}</p>
                  </div>
                  {isActive && <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)]"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule List */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-slate-100/50 p-10 rounded-[2.5rem] border border-slate-200/60">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200/50">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Audiencias para el {safeFormat(selectedDate, "d 'de' MMMM", { locale: es })}
              </h3>
            </div>

            <div className="space-y-10">
              {HORARIOS_AUDIENCIA.map(hora => (
                <div key={hora} className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-black text-slate-900">{hora} hs</span>
                    </div>
                    <div className="h-px flex-1 bg-slate-200/50"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(espacio => {
                      const audiencia = filteredAudiencias.find((a: any) => a.hora === hora && a.espacio === espacio);
                      return (
                        <div 
                          key={`${hora}-${espacio}`}
                          className={cn(
                            "flex items-stretch gap-6 p-6 rounded-[1.5rem] border transition-all duration-300",
                            audiencia 
                              ? "bg-white border-indigo-100 shadow-md shadow-indigo-500/5" 
                              : "bg-white/40 border-dashed border-slate-200/80"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-slate-100 pr-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esp.</span>
                            <span className="text-xl font-black text-slate-900">{espacio}</span>
                          </div>

                          {audiencia ? (
                            <div className="flex-1 flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">
                                    Exp. {expedientes.find((e: any) => e.id === audiencia.expedienteId)?.numero}
                                  </span>
                                </div>
                                <p className="text-base font-black text-slate-900 truncate max-w-[200px]">{audiencia.denunciante}</p>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-2 truncate max-w-[200px]">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {audiencia.denunciado}
                                </p>
                              </div>
                              <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Disponible</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print Audiencia Modal */}
      {isPrinting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 text-center w-full">Imprimir Agenda</h3>
              <button onClick={() => setIsPrinting(false)} className="p-2 hover:bg-slate-100 rounded-lg absolute right-6 top-6">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center">Seleccione el día que desea imprimir</p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Fecha a Imprimir</label>
                <input 
                  type="date"
                  value={dateToPrint}
                  onChange={(e) => setDateToPrint(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsPrinting(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const date = new Date(dateToPrint + 'T12:00:00');
                  printDailySchedule(date);
                }}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Audiencia Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Programar Audiencia</h3>
              <button onClick={handleCloseAdding} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Buscar Expediente</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Número, nombre o DNI..."
                    value={expedienteSearch}
                    onChange={(e) => setExpedienteSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Seleccionar Expediente</label>
                <select 
                  value={newAudiencia.expedienteId}
                  onChange={(e) => setNewAudiencia(prev => ({ ...prev, expedienteId: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Seleccione un expediente...</option>
                  {filteredExpedientesForSelect.slice(0, 50).map((exp: any) => (
                    <option key={exp.id} value={exp.id}>
                      #{exp.numero} - {exp.denunciante?.nombre || 'Sin nombre'} ({exp.denunciante?.dni || 'S/D'})
                    </option>
                  ))}
                </select>
                {filteredExpedientesForSelect.length > 50 && (
                  <p className="text-[10px] text-slate-400 italic">Mostrando los primeros 50 resultados. Use el buscador para filtrar.</p>
                )}
                {filteredExpedientesForSelect.length === 0 && expedienteSearch && (
                  <p className="text-[10px] text-rose-500 italic">No se encontraron expedientes con ese criterio.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Horario</label>
                  <select 
                    value={newAudiencia.hora}
                    onChange={(e) => setNewAudiencia(prev => ({ ...prev, hora: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {HORARIOS_AUDIENCIA.map(h => <option key={h} value={h}>{h} hs</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Espacio / Sala</label>
                  <select 
                    value={newAudiencia.espacio}
                    onChange={(e) => setNewAudiencia(prev => ({ ...prev, espacio: parseInt(e.target.value) as 1 | 2 }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value={1}>Espacio 1</option>
                    <option value={2}>Espacio 2</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleCloseAdding}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdd}
                disabled={!newAudiencia.expedienteId}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
