import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  History, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Building2,
  User as UserIcon,
  X,
  Upload,
  Printer
} from 'lucide-react';
import { es } from 'date-fns/locale';
import { cn, safeFormat } from '../../lib/utils';
import { Expediente, ExpedienteStatus } from '../../types';
import { ESTADOS } from '../../constants';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExpedientesProps {
  store: any;
}

export default function Expedientes({ store }: ExpedientesProps) {
  const { expedientes, updateExpedienteStatus } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ExpedienteStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');

  // Keep selected expediente in sync with store
  React.useEffect(() => {
    if (selectedExpediente) {
      const updated = expedientes.find((e: any) => e.id === selectedExpediente.id);
      if (updated) {
        setSelectedExpediente(updated);
      }
    }
  }, [expedientes]);

  const filteredExpedientes = expedientes.filter((exp: Expediente) => 
    String(exp.numero || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(exp.denunciante?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.empresas.some(e => String(e.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateStatus = () => {
    if (selectedExpediente && newStatus) {
      updateExpedienteStatus(selectedExpediente.id, newStatus, statusNotes);
      setIsUpdatingStatus(false);
      setNewStatus('');
      setStatusNotes('');
    }
  };

  const printExpediente = (exp: Expediente) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DEFENSA DEL CONSUMIDOR", 105, 15, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Expediente #${exp.numero}`, 105, 25, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Fecha de creación: ${safeFormat(exp.fechaCreacion, 'dd/MM/yyyy HH:mm')}`, 105, 32, { align: "center" });

    // Complainant Data
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL DENUNCIANTE", 14, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const denuncianteData = [
      ["Nombre", exp.denunciante.nombre],
      ["DNI", exp.denunciante.dni],
      ["Teléfono", exp.denunciante.telefono],
      ["Email", exp.denunciante.email],
      ["Domicilio", `${exp.denunciante.calle} ${exp.denunciante.numero}, ${exp.denunciante.barrio}`],
      ["Entre Calles", `${exp.denunciante.entreCalle1} y ${exp.denunciante.entreCalle2}`]
    ];
    
    autoTable(doc, {
      startY: 50,
      body: denuncianteData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // Companies
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EMPRESAS DENUNCIADAS", 14, currentY);
    
    const empresasData = exp.empresas.map(e => [e.nombre]);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Nombre de la Empresa']],
      body: empresasData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Claim Details
    const claimY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DEL RECLAMO", 14, claimY);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const claimData = [
      ["Estado Actual", exp.estado.toUpperCase()],
      ["Motivo del Reclamo", exp.motivoReclamo],
      ["Peticiones", exp.peticiones]
    ];
    
    autoTable(doc, {
      startY: claimY + 5,
      body: claimData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // Hearing
    if (exp.fechaAudiencia) {
      const hearingY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("AUDIENCIA PROGRAMADA", 14, hearingY);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${safeFormat(exp.fechaAudiencia, 'PPP', { locale: es })}`, 14, hearingY + 8);
    }

    // Timeline
    const timelineY = (doc as any).lastAutoTable.finalY + 25;
    if (timelineY < 250) { // Only if there's space on the same page
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("LÍNEA DE TIEMPO / MOVIMIENTOS", 14, timelineY);
      
      const timelineData = exp.timeline.slice().reverse().map(event => [
        safeFormat(event.date, 'dd/MM/yyyy HH:mm'),
        event.status.toUpperCase(),
        event.notes || '-'
      ]);
      
      autoTable(doc, {
        startY: timelineY + 5,
        head: [['Fecha', 'Estado', 'Notas']],
        body: timelineData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });
    }

    doc.save(`expediente_${exp.numero.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Expedientes</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por número, nombre..." 
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expediente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Denunciante</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Audiencia</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Mov.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpedientes.map((exp: Expediente) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-indigo-600">#{exp.numero}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{exp.denunciante.nombre}</p>
                    <p className="text-xs text-slate-500">{exp.denunciante.dni}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{exp.empresas[0]?.nombre}</p>
                    {exp.empresas.length > 1 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                        +{exp.empresas.length - 1} más
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {exp.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {exp.fechaAudiencia ? (
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{safeFormat(exp.fechaAudiencia, 'dd/MM/yyyy')}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 italic">No programada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{safeFormat(exp.fechaModificacion, 'dd/MM/yyyy')}</p>
                    <p className="text-[10px] text-slate-400">{safeFormat(exp.fechaModificacion, 'HH:mm')}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedExpediente(exp)}
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
        
        {filteredExpedientes.length === 0 && (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No se encontraron expedientes</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExpediente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Expediente #{selectedExpediente.numero}</h3>
                  <p className="text-sm text-slate-500 font-medium">Creado el {safeFormat(selectedExpediente.fechaCreacion, 'PPP', { locale: es })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => printExpediente(selectedExpediente)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  IMPRIMIR
                </button>
                <button 
                  onClick={() => setSelectedExpediente(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Info */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 border-r border-slate-100">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <UserIcon className="w-3 h-3" /> Datos del Denunciante
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-lg font-bold text-slate-900">{selectedExpediente.denunciante.nombre}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 font-medium">DNI</p>
                          <p className="font-bold text-slate-700">{selectedExpediente.denunciante.dni}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Teléfono</p>
                          <p className="font-bold text-slate-700">{selectedExpediente.denunciante.telefono}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 font-medium">Email</p>
                          <p className="font-bold text-slate-700">{selectedExpediente.denunciante.email}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 font-medium">Domicilio</p>
                          <p className="font-bold text-slate-700">
                            {selectedExpediente.denunciante.calle} {selectedExpediente.denunciante.numero}, {selectedExpediente.denunciante.barrio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="w-3 h-3" /> Empresas Denunciadas
                    </h4>
                    <div className="space-y-3">
                      {selectedExpediente.empresas.map((emp, i) => (
                        <div key={i} className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-amber-600" />
                          <p className="font-bold text-amber-900">{emp.nombre}</p>
                        </div>
                      ))}
                    </div>

                    {selectedExpediente.fechaAudiencia && (
                      <div className="space-y-4 pt-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> Audiencia Programada
                        </h4>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="font-bold text-indigo-900">
                              {safeFormat(selectedExpediente.fechaAudiencia, 'PPP', { locale: es })}
                            </p>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Fecha Confirmada</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Detalle del Reclamo
                  </h4>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <p className="text-sm font-bold text-slate-400 mb-1">Resumen del Reclamo</p>
                      <p className="text-slate-800 font-medium">{selectedExpediente.motivoReclamo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 mb-1">Peticiones</p>
                      <p className="text-slate-700 text-sm leading-relaxed italic">"{selectedExpediente.peticiones}"</p>
                    </div>
                  </div>
                </div>

                {/* Prueba Documental View */}
                {selectedExpediente.documentos && selectedExpediente.documentos.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Upload className="w-3 h-3" /> Prueba Documental
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedExpediente.documentos.map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                        >
                          <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-indigo-600 shadow-sm">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 truncate">Documento {idx + 1}</p>
                            <p className="text-[10px] text-slate-400">Haga clic para ver</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Timeline */}
              <div className="w-96 bg-slate-50 overflow-y-auto p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-3 h-3" /> Línea de Tiempo
                  </h4>
                  <button 
                    onClick={() => setIsUpdatingStatus(true)}
                    className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    CAMBIAR ESTADO
                  </button>
                </div>

                <div className="relative flex-1">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                  <div className="space-y-8 relative">
                    {Array.isArray(selectedExpediente.timeline) && selectedExpediente.timeline.length > 0 ? (
                      selectedExpediente.timeline.slice().reverse().map((event, i) => (
                        <div key={event.id} className="flex gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-4 border-white shadow-sm shrink-0 z-10",
                            i === 0 ? "bg-indigo-600" : "bg-slate-300"
                          )}></div>
                          <div className="space-y-1">
                            <p className={cn(
                              "text-xs font-bold uppercase tracking-tight",
                              i === 0 ? "text-indigo-600" : "text-slate-500"
                            )}>
                              {event.status}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {safeFormat(event.date, "d 'de' MMM, HH:mm", { locale: es })}
                            </p>
                            {event.notes && (
                              <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 mt-2 italic">
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <History className="w-8 h-8 text-slate-200 mb-2" />
                        <p className="text-xs text-slate-400 font-medium italic">No hay movimientos registrados</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Sub-Modal */}
          {isUpdatingStatus && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Actualizar Estado</h3>
                  <button onClick={() => setIsUpdatingStatus(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nuevo Estado</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ExpedienteStatus)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Seleccione un estado...</option>
                      {ESTADOS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Notas (Opcional)</label>
                    <textarea 
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Ej: Se notificó a las partes..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsUpdatingStatus(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleUpdateStatus}
                    disabled={!newStatus}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    Guardar Cambio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
