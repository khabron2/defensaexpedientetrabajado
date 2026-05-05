import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User as UserIcon, 
  MapPin, 
  Building2, 
  MessageSquare, 
  Calendar, 
  History,
  CheckCircle,
  Clock,
  Printer,
  History as HistoryIcon
} from 'lucide-react';
import { Case, User } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CaseDetail({ user }: { user: User }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCase = async () => {
    try {
      const res = await fetch('/api/cases');
      const data = await res.json();
      const found = data.find((item: Case) => item.id === id);
      setCase(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!c) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/cases/${c.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus, usuario: user.usuario }),
      });
      if (res.ok) {
        fetchCase();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateHearing = async (newDate: string) => {
    if (!c) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/cases/${c.id}/hearing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaAudiencia: newDate }),
      });
      if (res.ok) {
        fetchCase();
        alert("Audiencia reprogramada con éxito.");
      } else {
        const data = await res.json();
        alert(data.message || "Error al reprogramar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Cargando...</div>;
  if (!c) return <div className="text-center p-12">Caso no encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/list')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver a la lista</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          <Printer size={18} />
          Imprimir Carátula
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{c.id}</div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Expediente {c.numeroexpediente}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    c.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    c.estado === 'Completado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'
                  )}>
                    {c.estado}
                  </span>
                  <span className="text-slate-400 text-sm italic">• Creado por {c.usuario}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                <Calendar className="text-slate-400 mb-1" size={20} />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Audiencia</span>
                <span className="text-sm font-bold text-slate-800">
                  {c.fechaAudiencia ? format(new Date(c.fechaAudiencia), 'dd/MM/yyyy HH:mm') : 'Pendiente'}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <UserIcon className="text-blue-500" size={20} />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Denunciante</div>
                    <div className="font-semibold">{c.nombre} {c.apellido}</div>
                    <div className="text-sm text-slate-500">DNI: {c.dni}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-800">
                  <MapPin className="text-blue-500" size={20} />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Ubicación</div>
                    <div className="text-sm">{c.calle} {c.numeracion}, {c.barrio}</div>
                    <div className="text-xs text-slate-500">Entre {c.entrecalle1} y {c.entrecalle2}</div>
                    <div className="text-xs text-slate-500">{c.localidad}, {c.departamento}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Clasificación</div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{c.tipo}</span>
                    <span className="text-slate-800 font-medium">{c.caracteristicas}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Contacto</div>
                  <div className="text-sm text-slate-700">{c.email || 'Sin email'}</div>
                  <div className="text-sm text-slate-700">{c.telefono || 'Sin teléfono'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Companies */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} />
              Empresas Denunciadas
            </div>
            <div className="divide-y divide-slate-100">
              {c.empresasDenunciadas.map((emp, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{emp.nombre}</div>
                    <div className="text-sm text-slate-500">{emp.domicilio}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageSquare size={16} />
                Relato del Reclamo
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl italic">
                {c.reclamo}
              </p>
            </section>
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle size={16} />
                Peticiones
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {c.peticiones}
              </p>
            </section>
          </div>
        </div>

        {/* Sidebar / History */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-slate-400">
              <History size={18} className="text-blue-500" />
              Actualizar Estado
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Nuevo Estado</label>
                <input 
                  type="text"
                  placeholder="Ej: Pendiente de firma..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                  id="manualStatusInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) handleUpdateStatus(val.trim());
                    }
                  }}
                />
              </div>
              <button
                disabled={updating}
                onClick={() => {
                  const input = document.getElementById('manualStatusInput') as HTMLInputElement;
                  if (input.value.trim()) {
                    handleUpdateStatus(input.value.trim());
                    input.value = '';
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {updating ? 'Procesando...' : 'Guardar Nuevo Estado'}
                {!updating && <CheckCircle size={16} />}
              </button>
              <p className="text-[10px] text-slate-500 italic text-center px-2">
                El estado se registrará con su usuario y fecha actual en el historial.
              </p>
            </div>
          </div>

          {/* Hearing Action Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-slate-400">
              <Calendar size={18} className="text-blue-500" />
              Reprogramar Audiencia
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Nueva Fecha y Hora</label>
                <input 
                  type="datetime-local"
                  step="3600"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  id="hearingDateInput"
                  defaultValue={c.fechaAudiencia || ""}
                />
              </div>
              <button
                disabled={updating}
                onClick={() => {
                  const input = document.getElementById('hearingDateInput') as HTMLInputElement;
                  if (input.value) {
                    handleUpdateHearing(input.value);
                  } else {
                    alert("Por favor seleccione una fecha.");
                  }
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {updating ? 'Procesando...' : 'Cambiar Fecha/Hora'}
                {!updating && <Clock size={16} />}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <HistoryIcon size={18} className="text-slate-400" />
              Historial de Estados
            </h3>
            <div className="space-y-6">
              {c.historialEstados.slice().reverse().map((h, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-6 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
                  <div className="text-xs font-bold text-slate-900">{h.estado}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {format(new Date(h.fecha), "dd 'de' MMMM, HH:mm", { locale: es })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                    Por: {h.usuario}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
