import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, TrendingDown, Users, CheckCircle, Shield } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IncidentSeverity } from '../types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${trend === 'down' ? 'bg-emerald-50 text-emerald-600' : trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-5 flex items-center bg-slate-50 rounded-lg p-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${trend === 'down' ? 'bg-emerald-100 text-emerald-700' : trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
            {trend === 'down' ? '▼ Melhorou' : trend === 'up' ? '▲ Atenção' : '• Estável'} 
        </span>
        <span className="text-xs text-slate-500 ml-3 font-medium">{subtext}</span>
    </div>
  </div>
);

const DashboardSST: React.FC = () => {
  const { accidents, employees } = useData();

  // Cálculos Dinâmicos
  const totalAccidents = accidents.length;
  const graveAccidents = accidents.filter(a => a.severity === IncidentSeverity.GRAVE || a.severity === IncidentSeverity.FATAL).length;
  const activeEmployees = employees.length;

  // Calculate Days Without Accidents
  const calculateDaysWithoutAccidents = () => {
      if (accidents.length === 0) return 0;
      
      const sortedAccidents = [...accidents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastAccidentDate = new Date(sortedAccidents[0].date);
      const today = new Date();
      
      // Reset time part for accurate day calculation
      lastAccidentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastAccidentDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      
      return Math.max(0, diffDays);
  };

  const daysWithoutAccidents = calculateDaysWithoutAccidents();

  // Mock data generator based on real count for visualization
  const dataTrend = [
    { name: 'Jan', accidents: 2 },
    { name: 'Fev', accidents: 1 },
    { name: 'Mar', accidents: 0 },
    { name: 'Abr', accidents: 1 },
    { name: 'Mai', accidents: 0 },
    { name: 'Atual', accidents: totalAccidents },
  ];

  const dataDist = [
    { name: 'Leve', value: accidents.filter(a => a.severity === IncidentSeverity.LEVE).length },
    { name: 'Moderado', value: accidents.filter(a => a.severity === IncidentSeverity.MODERADO).length },
    { name: 'Grave', value: accidents.filter(a => a.severity === IncidentSeverity.GRAVE).length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Acidentes" 
          value={totalAccidents} 
          subtext="Ocorrências registradas" 
          icon={TrendingDown} 
          trend={totalAccidents > 5 ? 'up' : 'down'}
        />
        <StatCard 
          title="Acidentes Graves" 
          value={graveAccidents} 
          subtext="Requerem atenção imediata" 
          icon={AlertTriangle} 
          trend={graveAccidents > 0 ? 'up' : 'down'}
        />
        <StatCard 
          title="Treinamentos" 
          value="92%" 
          subtext="Conformidade da equipe" 
          icon={CheckCircle} 
          trend="neutral"
        />
        <StatCard 
          title="Dias Sem Acidentes" 
          value={daysWithoutAccidents} 
          subtext="Desde o último registro" 
          icon={Shield} 
          trend={daysWithoutAccidents > 30 ? 'down' : 'up'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tendência de Acidentalidade</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataTrend} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="accidents" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAccidents)" name="Acidentes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Gravidade das Ocorrências</h3>
            <div className="flex-1 min-h-[320px]">
                {dataDist.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataDist}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {dataDist.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="circle"
                              formatter={(value, entry, index) => <span className="text-slate-700 font-medium ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle className="w-12 h-12 text-emerald-100 mb-3" />
                        <span className="text-sm font-medium">Nenhum dado para exibir</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSST;