import React from 'react';
import { 
  Files, 
  Clock, 
  AlertCircle, 
  TrendingUp,
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { es } from 'date-fns/locale';
import { cn, safeFormat } from '../../lib/utils';

interface DashboardProps {
  store: any;
}

export default function Dashboard({ store }: DashboardProps) {
  const { expedientes } = store;
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedByMod = [...expedientes].sort((a: any, b: any) => {
    const dateA = new Date(a.fechaModificacion).getTime() || 0;
    const dateB = new Date(b.fechaModificacion).getTime() || 0;
    return dateB - dateA;
  });

  const stats = [
    { label: 'Total Expedientes', value: expedientes.length, icon: Files, color: 'bg-indigo-500' },
    { label: 'Último Ingresado', value: expedientes[0]?.numero || '-', icon: Clock, color: 'bg-amber-500' },
    { label: 'Último Modificado', value: sortedByMod[0]?.numero || '-', icon: AlertCircle, color: 'bg-rose-500' },
  ];

  // Mock data for charts
  const chartData = [
    { name: 'Lun', value: 12 },
    { name: 'Mar', value: 19 },
    { name: 'Mie', value: 15 },
    { name: 'Jue', value: 22 },
    { name: 'Vie', value: 30 },
    { name: 'Sab', value: 10 },
    { name: 'Dom', value: 5 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Resumen de Actividad</h2>
        <p className="text-slate-500 font-medium">
          {safeFormat(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Ingresos Semanales</h3>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              +12% vs semana anterior
            </div>
          </div>
          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="99%" height="99%" minWidth={0} minHeight={0}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Últimos Movimientos</h3>
          <div className="space-y-6">
            {expedientes.slice(0, 5).map((exp: any) => (
              <div key={exp.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <Files className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Exp. {exp.numero}</p>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{exp.denunciante.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600 uppercase">{exp.estado.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {safeFormat(exp.fechaModificacion, 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {expedientes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium italic">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

