import React from 'react';
import { Plus, Search, Filter, Calendar, Tag, ChevronRight, Trash2, Edit3, Library } from 'lucide-react';
import { ExperimentRecord } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ExperimentCardProps {
  experiment: ExperimentRecord;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment, onClick, onDelete, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '已完成': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '已失败': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden flex flex-col"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(experiment.status)}`}>
            {experiment.status}
          </span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-brand-accent hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-brand-accent transition-colors">
          {experiment.title}
        </h3>
        
        <div className="flex items-center gap-4 text-slate-500 text-xs mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(experiment.date), 'yyyy-MM-dd')}
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {experiment.type}
          </div>
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {experiment.purpose || '暂无实验目的描述...'}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {experiment.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {experiment.tags.length > 3 && (
            <span className="text-[10px] text-slate-400">+{experiment.tags.length - 3}</span>
          )}
        </div>
      </div>
      
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] text-slate-400">
          更新于 {format(experiment.updatedAt, 'MM-dd HH:mm', { locale: zhCN })}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

interface ExperimentListProps {
  experiments: ExperimentRecord[];
  onView: (exp: ExperimentRecord) => void;
  onEdit: (exp: ExperimentRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const ExperimentList: React.FC<ExperimentListProps> = ({ experiments, onView, onEdit, onDelete, onAddNew }) => {
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState('全部');
  const [sortBy, setSortBy] = React.useState('newest');

  const types = ['全部', ...Array.from(new Set(experiments.map(e => e.type)))];

  const filteredExperiments = experiments
    .filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) || 
                           exp.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesType = filterType === '全部' || exp.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.date.localeCompare(a.date);
      return a.date.localeCompare(b.date);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="搜索实验标题或标签..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          
          <select 
            className="flex-1 md:flex-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">最新日期</option>
            <option value="oldest">最早日期</option>
          </select>
          
          <button 
            onClick={onAddNew}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新建实验
          </button>
        </div>
      </div>

      {filteredExperiments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperiments.map(exp => (
            <ExperimentCard 
              key={exp.id} 
              experiment={exp} 
              onClick={() => onView(exp)}
              onEdit={(e) => { e.stopPropagation(); onEdit(exp); }}
              onDelete={(e) => { e.stopPropagation(); if(confirm('确定删除该实验记录吗？')) onDelete(exp.id); }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Library className="text-slate-300 w-8 h-8" />
          </div>
          <h3 className="text-slate-800 font-semibold mb-1">暂无实验记录</h3>
          <p className="text-slate-500 text-sm mb-6">开始记录您的第一个科研实验吧</p>
          <button 
            onClick={onAddNew}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-primary/90 transition-all shadow-md active:scale-95"
          >
            立即创建
          </button>
        </div>
      )}
    </div>
  );
};
