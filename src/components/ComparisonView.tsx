import React from 'react';
import { BarChart2, Filter, Download, Info } from 'lucide-react';
import { ExperimentRecord } from '../types';

interface ComparisonViewProps {
  experiments: ExperimentRecord[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ experiments }) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [filterType, setFilterType] = React.useState('全部');

  const types = ['全部', ...Array.from(new Set(experiments.map(e => e.type)))];
  
  const filteredExps = experiments.filter(e => filterType === '全部' || e.type === filterType);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedExperiments = experiments.filter(e => selectedIds.includes(e.id));

  // Get all unique data labels from selected experiments
  const allDataLabels = Array.from(new Set(
    selectedExperiments.flatMap(e => e.data.map(d => d.label))
  )).filter(label => label.trim() !== '');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="text-brand-accent w-6 h-6" />
            实验条件对比
          </h1>
          <p className="text-slate-500 text-sm mt-1">选择多个实验，横向对比其关键参数与结果。</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent/20 outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download className="w-4 h-4" />
            导出对比
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              选择实验 ({selectedIds.length})
              {selectedIds.length > 0 && (
                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] text-brand-accent hover:underline lowercase"
                >
                  清除全部
                </button>
              )}
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredExps.map(exp => (
                <label 
                  key={exp.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedIds.includes(exp.id) 
                      ? 'bg-brand-accent/5 border-brand-accent' 
                      : 'bg-slate-50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                    checked={selectedIds.includes(exp.id)}
                    onChange={() => toggleSelection(exp.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{exp.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{exp.date} · {exp.type}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-3">
          {selectedExperiments.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase border-r border-slate-100 min-w-[150px]">对比项</th>
                      {selectedExperiments.map(exp => (
                        <th key={exp.id} className="px-6 py-4 text-sm font-bold text-slate-800 min-w-[200px] border-r border-slate-100 last:border-r-0">
                          {exp.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Basic Info Rows */}
                    <tr>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 border-r border-slate-100">实验状态</td>
                      {selectedExperiments.map(exp => (
                        <td key={exp.id} className="px-6 py-4 text-sm border-r border-slate-100 last:border-r-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            exp.status === '进行中' ? 'bg-blue-100 text-blue-700' : 
                            exp.status === '已完成' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Dynamic Data Rows */}
                    {allDataLabels.map(label => (
                      <tr key={label}>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 border-r border-slate-100">{label}</td>
                        {selectedExperiments.map(exp => {
                          const dataPoint = exp.data.find(d => d.label === label);
                          return (
                            <td key={exp.id} className="px-6 py-4 text-sm font-mono text-slate-700 border-r border-slate-100 last:border-r-0">
                              {dataPoint ? `${dataPoint.value} ${dataPoint.unit}` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Results Summary Row */}
                    <tr>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 border-r border-slate-100">实验结果</td>
                      {selectedExperiments.map(exp => (
                        <td key={exp.id} className="px-6 py-4 text-sm text-slate-600 border-r border-slate-100 last:border-r-0">
                          <div className="line-clamp-3 text-xs leading-relaxed">{exp.results || '未填写'}</div>
                        </td>
                      ))}
                    </tr>

                    {/* Reflection Row */}
                    <tr>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 border-r border-slate-100">反思/心得</td>
                      {selectedExperiments.map(exp => (
                        <td key={exp.id} className="px-6 py-4 text-sm text-slate-600 italic border-r border-slate-100 last:border-r-0">
                          <div className="line-clamp-3 text-xs leading-relaxed">{exp.reflection || '未填写'}</div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="text-slate-300 w-8 h-8" />
              </div>
              <h3 className="text-slate-800 font-semibold mb-1">未选择对比实验</h3>
              <p className="text-slate-500 text-sm">请从左侧列表中勾选至少两个实验进行横向对比。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
