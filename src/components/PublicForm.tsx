import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Building2, FileText, Upload, Send, ShieldCheck, Search, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { Expediente } from '../types';

interface PublicFormProps {
  onOpenCRM: () => void;
  addExpediente: (data: any) => void;
  expedientes: Expediente[];
}

export default function PublicForm({ onOpenCRM, addExpediente, expedientes }: PublicFormProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'search'>('form');
  const [numEmpresas, setNumEmpresas] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    denunciante: {
      nombre: '',
      dni: '',
      telefono: '',
      email: '',
      calle: '',
      numero: '',
      barrio: '',
      entreCalle1: '',
      entreCalle2: '',
    },
    empresas: [{ nombre: '' }],
    motivoReclamo: '',
    peticiones: '',
  });

  const handleInputChange = (section: string, field: string, value: any, index?: number) => {
    setFormData(prev => {
      if (section === 'denunciante') {
        return { ...prev, denunciante: { ...prev.denunciante, [field]: value } };
      }
      if (section === 'empresas' && typeof index === 'number') {
        const newEmpresas = [...prev.empresas];
        newEmpresas[index] = { ...newEmpresas[index], [field]: value };
        return { ...prev, empresas: newEmpresas };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleNumEmpresasChange = (val: number) => {
    setNumEmpresas(val);
    setFormData(prev => {
      const newEmpresas = [...prev.empresas];
      if (val > prev.empresas.length) {
        for (let i = prev.empresas.length; i < val; i++) {
          newEmpresas.push({ nombre: '' });
        }
      } else {
        newEmpresas.splice(val);
      }
      return { ...prev, empresas: newEmpresas };
    });
  };

  const resetForm = () => {
    setFormData({
      denunciante: {
        nombre: '',
        dni: '',
        telefono: '',
        email: '',
        calle: '',
        numero: '',
        barrio: '',
        entreCalle1: '',
        entreCalle2: '',
      },
      empresas: [{ nombre: '' }],
      motivoReclamo: '',
      peticiones: '',
    });
    setNumEmpresas(1);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    addExpediente({
      ...formData,
      documentos: [],
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const result = expedientes.find(exp => 
      String(exp.numero).split('/')[0] === searchQuery || 
      String(exp.numero) === searchQuery ||
      exp.denunciante.dni === searchQuery
    );
    setSearchResult(result || 'not_found');
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Reclamo Cargado con Éxito!</h2>
          <div className="space-y-4 mb-8">
            <p className="text-slate-600">
              Su expediente ha sido generado correctamente y pronto será revisado por nuestro equipo legal.
            </p>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
              <p className="text-amber-800 font-medium">
                Importante: Recuerde acercarse a nuestras oficinas con la documentación física de respaldo en los próximos 5 días hábiles para continuar con el trámite. De lo contrario, el reclamo quedará sin efecto.
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Cargar otro reclamo
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Defensa del Consumidor</h1>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button 
            onClick={() => setActiveTab('form')}
            className={cn(
              "w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === 'form' 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-0.5" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Nuevo Reclamo
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={cn(
              "w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === 'search' 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-0.5" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Consultar Estado
          </button>
        </div>
      </header>

      {activeTab === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos del Denunciante */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Datos del Denunciante</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Juan Pérez"
              value={formData.denunciante.nombre}
              onChange={(e) => handleInputChange('denunciante', 'nombre', e.target.value)}
              required
            />
            <Input
              label="DNI / CUIL"
              placeholder="Sin puntos ni espacios"
              value={formData.denunciante.dni}
              onChange={(e) => handleInputChange('denunciante', 'dni', e.target.value)}
              required
            />
            <Input
              label="Teléfono de Contacto"
              placeholder="Ej: 3834123456"
              value={formData.denunciante.telefono}
              onChange={(e) => handleInputChange('denunciante', 'telefono', e.target.value)}
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.denunciante.email}
              onChange={(e) => handleInputChange('denunciante', 'email', e.target.value)}
              required
            />
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Calle"
                placeholder="Ej: Av. Belgrano"
                value={formData.denunciante.calle}
                onChange={(e) => handleInputChange('denunciante', 'calle', e.target.value)}
                required
              />
              <Input
                label="Numeración / Lote"
                placeholder="Ej: 123 o Lote 4"
                value={formData.denunciante.numero}
                onChange={(e) => handleInputChange('denunciante', 'numero', e.target.value)}
                required
              />
              <Input
                label="Barrio"
                placeholder="Ej: Centro"
                value={formData.denunciante.barrio}
                onChange={(e) => handleInputChange('denunciante', 'barrio', e.target.value)}
                required
              />
            </div>
            <Input
              label="Entre Calle 1"
              placeholder="Calle de referencia 1"
              value={formData.denunciante.entreCalle1}
              onChange={(e) => handleInputChange('denunciante', 'entreCalle1', e.target.value)}
            />
            <Input
              label="Entre Calle 2"
              placeholder="Calle de referencia 2"
              value={formData.denunciante.entreCalle2}
              onChange={(e) => handleInputChange('denunciante', 'entreCalle2', e.target.value)}
            />
          </div>
        </section>

        {/* Datos de la Empresa */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Datos de la Empresa</h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 px-2">¿Cuántas empresas?</span>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumEmpresasChange(n)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                    numEmpresas === n
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {formData.empresas.map((emp, idx) => (
              <Input
                key={idx}
                label={`Empresa Denunciada ${numEmpresas > 1 ? idx + 1 : ''}`}
                placeholder="Nombre de la empresa o comercio"
                value={emp.nombre}
                onChange={(e) => handleInputChange('empresas', 'nombre', e.target.value, idx)}
                required
              />
            ))}
          </div>
        </section>

        {/* Motivo del Reclamo */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Motivo del Reclamo</h2>
          </div>

          <div className="space-y-6">
            <TextArea
              label="Resumen del Reclamo"
              placeholder="Describa detalladamente lo sucedido..."
              value={formData.motivoReclamo}
              onChange={(e) => handleInputChange('root', 'motivoReclamo', e.target.value)}
              required
            />
            <TextArea
              label="Peticiones"
              placeholder="¿Qué solicita a la empresa? Ej: Devolución de dinero, Reparación del producto, etc."
              value={formData.peticiones}
              onChange={(e) => handleInputChange('root', 'peticiones', e.target.value)}
              required
            />
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
        >
          <Send className="w-5 h-5" />
          Cargar Reclamo
        </button>
      </form>
      ) : (
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Consultar Expediente</h2>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input 
                  label="Número de Expediente o DNI"
                  placeholder="Ej: 1001 o 35123456"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  type="submit"
                  className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Buscar
                </button>
                <button 
                  type="button"
                  onClick={handleClearSearch}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </section>

          {searchResult === 'not_found' && (
            <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl text-center">
              <p className="text-rose-600 font-bold">No se encontró ningún expediente con esos datos.</p>
              <p className="text-rose-400 text-sm">Verifique el número e intente nuevamente.</p>
            </div>
          )}

          {searchResult && searchResult !== 'not_found' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Número de Expediente</p>
                    <h3 className="text-2xl font-black text-slate-900">
                      #{searchResult.numero}{!String(searchResult.numero).includes('/') && `/${new Date(searchResult.fechaCreacion).getFullYear()}`}
                    </h3>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">DNI del Denunciante</p>
                    <p className="text-lg font-bold text-slate-700">{searchResult.denunciante.dni}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contra quien es el reclamo</p>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 inline-block">
                      <p className="font-bold text-amber-900">{searchResult.empresas[0]?.nombre}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Último Estado / Movimiento</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                      <p className="text-lg font-bold text-indigo-600 uppercase">{searchResult.estado}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Actualizado el {new Date(searchResult.fechaModificacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
      />
    </div>
  );
}

function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 resize-none"
      />
    </div>
  );
}

