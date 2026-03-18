import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Hash, 
  Save, 
  Trash2, 
  Shield,
  User as UserIcon,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfiguracionProps {
  store: any;
}

export default function Configuracion({ store }: ConfiguracionProps) {
  const { users, settings, addUser, deleteUser, setSettings } = store;
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');
  const [nextNum, setNextNum] = useState(settings.proximoNumero);
  const [saved, setSaved] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername) {
      addUser(newUsername, newRole);
      setNewUsername('');
    }
  };

  const handleSaveSettings = () => {
    setSettings({ proximoNumero: nextNum });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-12">
      {/* User Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add User Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Nuevo Usuario
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej: jgomez"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="staff">Personal (Staff)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Crear Usuario
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">Usuarios Administrativos</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((user: any) => (
                <div key={user.id} className="px-6 py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.username}</p>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-indigo-500" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('¿Está seguro de eliminar este usuario?')) {
                        deleteUser(user.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* System Settings */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Hash className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Numeración de Expedientes</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="max-w-md space-y-6">
            <p className="text-sm text-slate-500 leading-relaxed">
              Configure el número desde el cual el sistema empezará a generar nuevos expedientes (últimos 4 dígitos).
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Número</label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  value={nextNum}
                  onChange={(e) => setNextNum(parseInt(e.target.value))}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-mono font-bold"
                />
                <button 
                  onClick={handleSaveSettings}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                    saved 
                      ? "bg-emerald-500 text-white" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                  )}
                >
                  {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  {saved ? 'Guardado' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
