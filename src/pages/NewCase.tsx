import React, { useState } from 'react';
import { 
  Save, 
  Trash2, 
  Plus, 
  Building2, 
  User as UserIcon, 
  MapPin, 
  ClipboardList,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react';
import { Company, User } from '../types';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function NewCase({ user }: { user: User }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    barrio: '',
    calle: '',
    numeracion: '',
    entrecalle1: '',
    entrecalle2: '',
    localidad: 'San Fernando del Valle',
    departamento: 'Capital',
    tipo: 'Servicio' as 'Servicio' | 'Producto',
    caracteristicas: '',
    reclamo: '',
    peticiones: '',
    fechaAudiencia: '',
  });

  const [empresas, setEmpresas] = useState<Company[]>([]);

  const handleAddCompany = () => {
    setEmpresas([...empresas, { nombre: '', domicilio: '' }]);
  };

  const handleRemoveCompany = (index: number) => {
    const list = [...empresas];
    list.splice(index, 1);
    setEmpresas(list);
  };

  const updateCompany = (index: number, field: keyof Company, value: string) => {
    const list = [...empresas];
    list[index][field] = value;
    setEmpresas(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Additional validations
    if (formData.dni.length < 7 || formData.dni.length > 8 || !/^\d+$/.test(formData.dni)) {
      setError('DNI debe ser númerico de 7 u 8 dígitos.');
      setLoading(false);
      return;
    }

    if (formData.reclamo.length < 20) {
      setError('El reclamo debe tener al menos 20 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          empresasDenunciadas: empresas,
          activeUser: user.usuario
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear el caso');
      }

      navigate('/list');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const characteristicOptions = {
    Servicio: ['Internet', 'Gas', 'Luz', 'Agua', 'Telefonía'],
    Producto: ['TV', 'Lavarropas', 'Heladera', 'Celular']
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
      {error && (
        <div className="sticky top-0 z-10 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Section: Personal Data */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
          <UserIcon size={18} />
          Datos del Denunciante
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Nombre *</label>
            <input 
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Apellido *</label>
            <input 
              required
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">DNI * (7-8 dígitos)</label>
            <input 
              required
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Teléfono</label>
            <input 
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Section: Address */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
          <MapPin size={18} />
          Domicilio
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Barrio</label>
            <input 
              value={formData.barrio}
              onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Calle</label>
            <input 
              value={formData.calle}
              onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Numeración</label>
            <input 
              value={formData.numeracion}
              onChange={(e) => setFormData({ ...formData, numeracion: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Entrecalle 1</label>
            <input 
              value={formData.entrecalle1}
              onChange={(e) => setFormData({ ...formData, entrecalle1: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Entrecalle 2</label>
            <input 
              value={formData.entrecalle2}
              onChange={(e) => setFormData({ ...formData, entrecalle2: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Localidad</label>
            <input 
              value={formData.localidad}
              onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Section: Classification */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
          <Filter size={18} />
          Clasificación y Tipo
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Tipo *</label>
            <select 
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any, caracteristicas: '' })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="Servicio">Servicio</option>
              <option value="Producto">Producto</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Características *</label>
            <select 
              required
              value={formData.caracteristicas}
              onChange={(e) => setFormData({ ...formData, caracteristicas: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Seleccione una opción</option>
              {characteristicOptions[formData.tipo].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section: Denounced Companies */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            Empresas Denunciadas
          </div>
          <button 
            type="button"
            onClick={handleAddCompany}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-all"
          >
            <Plus size={14} />
            Agregar Empresa
          </button>
        </div>
        <div className="p-6 space-y-4">
          {empresas.map((emp, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50"
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Nombre de Empresa</label>
                <input 
                  required
                  value={emp.nombre}
                  onChange={(e) => updateCompany(idx, 'nombre', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Domicilio</label>
                <input 
                  value={emp.domicilio}
                  onChange={(e) => updateCompany(idx, 'domicilio', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="button"
                  onClick={() => handleRemoveCompany(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {empresas.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
              Presione el botón para agregar empresas denunciadas.
            </div>
          )}
        </div>
      </section>

      {/* Section: Case Content */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
          <ClipboardList size={18} />
          Cuerpo del Reclamo
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Reclamo * (Min 20 caracteres)</label>
            <textarea 
              required
              rows={4}
              value={formData.reclamo}
              onChange={(e) => setFormData({ ...formData, reclamo: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
              placeholder="Describa el reclamo detalladamente..."
            />
            <div className="text-xs text-slate-400 text-right">{formData.reclamo.length} caracteres</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Peticiones * (Min 10 caracteres)</label>
            <textarea 
              required
              rows={3}
              value={formData.peticiones}
              onChange={(e) => setFormData({ ...formData, peticiones: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
              placeholder="¿Qué solicita el denunciante?"
            />
          </div>
        </div>
      </section>

      {/* Section: Hearing */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
          <Calendar size={18} />
          Programación de Audiencia
        </div>
        <div className="p-6">
          <div className="max-w-md space-y-2">
            <label className="text-sm font-medium text-slate-600">Fecha y Hora</label>
            <input 
              type="datetime-local"
              value={formData.fechaAudiencia}
              onChange={(e) => setFormData({ ...formData, fechaAudiencia: e.target.value })}
              step="3600"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="text-xs text-slate-400 italic">
              Recordatorio: Los horarios permitidos son 08:00, 09:00, 10:00 y 11:00 hs.
              Máximo 2 registros por cupo.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4 p-4">
        <button 
          type="button"
          onClick={() => navigate('/list')}
          className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 transition-all transform hover:-translate-y-1"
        >
          <Save size={20} />
          {loading ? 'Guardando...' : 'Crear Expediente'}
        </button>
      </div>
    </form>
  );
}
