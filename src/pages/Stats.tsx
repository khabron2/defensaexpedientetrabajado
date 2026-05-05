import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { LayoutDashboard, Users, MapPin, Building2, Package } from 'lucide-react';

export default function Stats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando estadísticas...</div>;

  const tipoData = Object.entries(stats.byTipo).map(([name, value]) => ({ name, value }));
  const charData = Object.entries(stats.byCaracteristicas).map(([name, value]) => ({ name, value }));
  const deptData = Object.entries(stats.byDepartamento).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl w-fit">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Expedientes</div>
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{stats.total}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Servicios</p>
              <div className="p-2 bg-white/10 rounded-xl">
                <Package size={20} className="text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-black tracking-tighter">{stats.byTipo['Servicio'] || 0}</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Registrados</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl w-fit">
              <Building2 size={24} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Productos</div>
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{stats.byTipo['Producto'] || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl w-fit">
              <MapPin size={24} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Localidades</div>
              <div className="text-4xl font-black text-slate-900 tracking-tighter tracking-tighter">{deptData.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart: By Type */}
        <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
            Distribución por Tipo
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tipoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {tipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} radius={[10, 10, 10, 10] as any} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Characteristics */}
        <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">
            Características Principales
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b', textTransform: 'uppercase' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
