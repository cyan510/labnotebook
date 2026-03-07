import React from 'react';
import { 
  Plus, Library, BookOpen, Clock, 
  TrendingUp, CheckCircle2, AlertCircle, 
  ChevronRight, Calendar
} from 'lucide-react';
import { ExperimentRecord, LiteratureRecord } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface DashboardProps {
  experiments: ExperimentRecord[];
  literature: LiteratureRecord[];
  onAddNew: () => void;
  onViewExperiment: (exp: ExperimentRecord) => void;
  onViewLibrary: () => void;
  onViewLiterature: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  experiments, 
  literature, 
  onAddNew, 
  onViewExperiment,
  onViewLibrary,
  onViewLiterature
}) => {
  const stats = [
    { label: '总实验数', value: experiments.length, icon: Library, color: 'text-blue-600', bg: 'bg-blue-50', onClick: onViewLibrary },
    { label: '进行中', value: experiments.filter(e => e.status === '进行中').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', onClick: onViewLibrary },
    { label: '已完成', value: experiments.filter(e => e.status === '已完成').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: onViewLibrary },
    { label: '文献库', value: literature.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', onClick: onViewLiterature },
  ];

  const recentExperiments = experiments.slice(0, 5);

  // Data for chart: Experiments per month (last 6 months)
  const chartData = React.useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(d, 'MMM', { locale: zhCN });
      months[key] = 0;
    }

    experiments.forEach(exp => {
      const expDate = new Date(exp.date);
      const key = format(expDate, 'MMM', { locale: zhCN });
      if (months[key] !== undefined) {
        months[key]++;
      }
    });

    return Object.entries(months).map(([name, count]) => ({ name, count }));
  }, [experiments]);

  const getGreeting = () => {
    // Get current time in UTC+8
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const beijingTime = new Date(utc + (3600000 * 8));
    const hour = beijingTime.getHours();
    const minute = beijingTime.getMinutes();
    const timeValue = hour + minute / 60;

    if (timeValue >= 0 && timeValue <= 6) {
      return '凌晨好，科研人';
    } else if (timeValue > 6 && timeValue <= 12) {
      return '早上好，科研人';
    } else if (timeValue > 12 && timeValue <= 18) {
      return '下午好，科研人';
    } else {
      return '晚上好，科研人';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{getGreeting()}</h1>
          <p className="text-slate-500 mt-1">今天也要保持严谨，记录下每一个关键发现。</p>
        </div>
        <button 
          onClick={onAddNew}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          开始新实验
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            onClick={stat.onClick}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Experiments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-accent" />
              最近实验记录
            </h2>
            <button 
              onClick={onViewLibrary}
              className="text-sm font-semibold text-brand-accent hover:underline flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {recentExperiments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentExperiments.map(exp => (
                  <div 
                    key={exp.id} 
                    onClick={() => onViewExperiment(exp)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${
                        exp.status === '进行中' ? 'bg-blue-400' : 
                        exp.status === '已完成' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-brand-accent transition-colors">{exp.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(exp.date), 'yyyy-MM-dd')}
                          </span>
                          <span>{exp.type}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-400 text-sm">暂无实验记录，点击上方按钮开始创建。</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-accent" />
            实验趋势
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">近六个月实验产出</span>
            </div>
          </div>
        </div>
      </div>

      {/* Literature Quick Access */}
      <div 
        onClick={onViewLiterature}
        className="bg-brand-primary rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative cursor-pointer hover:shadow-lg hover:shadow-brand-primary/20 transition-all active:scale-[0.99]"
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">文献实验库</h3>
          <p className="text-white/70 max-w-md">
            将论文中的实验流程转化为结构化记录，方便随时对比与复现。目前已收录 {literature.length} 篇关键文献。
          </p>
          <button 
            className="mt-6 bg-white text-brand-primary px-6 py-2 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2"
          >
            进入库
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <BookOpen className="w-48 h-48 text-white/10 absolute -right-8 -bottom-8 rotate-12" />
      </div>
    </div>
  );
};
