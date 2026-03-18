import React from 'react';
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
import { Download, Filter, FileText, PieChart as PieChartIcon } from 'lucide-react';

interface ReportesProps {
  store: any;
}

export default function Reportes({ store }: ReportesProps) {
  const { expedientes } = store;
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate stats by status
  const statusCounts = expedientes.reduce((acc: any, exp: any) => {
    const status = exp.estado.split(' ')[0]; // Group by first word for simplicity in chart
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  
  const COLORS = ['#4f46e5', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Reportes e Informes</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution by Status */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Distribución por Estado</h3>
          </div>
          <div className="h-80 w-full">
            {isMounted && (
              <ResponsiveContainer width="99%" height="99%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Volume by Month (Mock) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <BarChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Volumen Mensual</h3>
          </div>
          <div className="h-80 w-full">
            {isMounted && (
              <ResponsiveContainer width="99%" height="99%" minWidth={0} minHeight={0}>
                <BarChart data={[
                  { month: 'Ene', count: 45 },
                  { month: 'Feb', count: 52 },
                  { month: 'Mar', count: 38 },
                  { month: 'Abr', count: 65 },
                  { month: 'May', count: 48 },
                  { month: 'Jun', count: 59 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Resumen Estadístico</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Audiencias</p>
            <p className="text-2xl font-black text-slate-900">{store.audiencias.length}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-2">+5% vs mes pasado</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notificaciones</p>
            <p className="text-2xl font-black text-slate-900">124</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">En proceso</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Auto Imputaciones</p>
            <p className="text-2xl font-black text-slate-900">18</p>
            <p className="text-[10px] text-rose-600 font-bold mt-2">Requiere atención</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Traslados</p>
            <p className="text-2xl font-black text-slate-900">42</p>
            <p className="text-[10px] text-indigo-600 font-bold mt-2">Completados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
