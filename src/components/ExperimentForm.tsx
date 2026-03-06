import React, { useEffect, useRef } from 'react';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  FileText, ClipboardList, Database, MessageSquare, 
  AlertCircle, Layout, Timer, Play, Pause, RotateCcw
} from 'lucide-react';
import { ExperimentRecord, ExperimentStep, ExperimentDataRow, ExperimentStatus, ExperimentTimer } from '../types';

interface ExperimentFormProps {
  initialData?: Partial<ExperimentRecord>;
  onSave: (data: ExperimentRecord) => void;
  onCancel: () => void;
}

export const ExperimentForm: React.FC<ExperimentFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState<Partial<ExperimentRecord>>({
    id: initialData?.id || crypto.randomUUID(),
    title: initialData?.title || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || '材料合成',
    tags: initialData?.tags || [],
    status: initialData?.status || '进行中',
    purpose: initialData?.purpose || '',
    materials: initialData?.materials || '',
    equipment: initialData?.equipment || '',
    steps: initialData?.steps || [{ id: '1', content: '' }],
    process: initialData?.process || '',
    data: initialData?.data || [{ id: '1', label: '', value: '', unit: '' }],
    results: initialData?.results || '',
    images: initialData?.images || [],
    reflection: initialData?.reflection || '',
    timers: initialData?.timers || [],
    createdAt: initialData?.createdAt || Date.now(),
    updatedAt: Date.now(),
  });

  const [newTag, setNewTag] = React.useState('');

  const handleAddTimer = () => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setFormData(prev => ({
      ...prev,
      timers: [...(prev.timers || []), { id: crypto.randomUUID(), label: '新时间点', time: timeString }]
    }));
  };

  const removeTimer = (id: string) => {
    setFormData(prev => ({
      ...prev,
      timers: prev.timers?.filter(t => t.id !== id)
    }));
  };

  const updateTimerLabel = (id: string, label: string) => {
    setFormData(prev => ({
      ...prev,
      timers: prev.timers?.map(t => t.id === id ? { ...t, label } : t)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { id: crypto.randomUUID(), content: '' }]
    }));
  };

  const handleStepChange = (id: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.map(s => s.id === id ? { ...s, content } : s)
    }));
  };

  const handleRemoveStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.filter(s => s.id !== id)
    }));
  };

  const handleAddDataRow = () => {
    setFormData(prev => ({
      ...prev,
      data: [...(prev.data || []), { id: crypto.randomUUID(), label: '', value: '', unit: '' }]
    }));
  };

  const handleDataChange = (id: string, field: keyof ExperimentDataRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      data: prev.data?.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const handleRemoveDataRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      data: prev.data?.filter(d => d.id !== id)
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(newTag.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag.trim()] }));
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), { data: reader.result as string, caption: '' }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpdateImageCaption = (index: number, caption: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.map((img, i) => {
        if (i === index) {
          return typeof img === 'string' ? { data: img, caption } : { ...img, caption };
        }
        return img;
      })
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('请输入实验标题');
      return;
    }
    onSave(formData as ExperimentRecord);
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-4 pb-2 border-b border-slate-100">
      <Icon className="w-5 h-5" />
      {title}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between sticky top-16 z-40 bg-brand-secondary/80 backdrop-blur-md py-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData?.id ? '编辑实验记录' : '新建实验记录'}
        </h2>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            type="submit"
            className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            保存记录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <SectionTitle icon={Layout} title="基本信息" />
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">实验标题 *</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="例如：TiO2纳米颗粒的溶剂热合成"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">实验日期</label>
                <input 
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">实验状态</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
                >
                  <option value="进行中">进行中</option>
                  <option value="已完成">已完成</option>
                  <option value="已失败">已失败</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">实验类型</label>
              <input 
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="材料合成 / 光催化 / 表征..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">标签 (按回车添加)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-md text-xs font-medium">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => handleRemoveTag(tag)} />
                  </span>
                ))}
              </div>
              <input 
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="添加标签..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <SectionTitle icon={Timer} title="时间点记录" />
            <div className="space-y-3">
              {formData.timers?.map((timer) => (
                <div key={timer.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={timer.label}
                      onChange={(e) => updateTimerLabel(timer.id, e.target.value)}
                      placeholder="时间点名称"
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none focus:text-brand-accent w-full mb-1"
                    />
                    <div className="text-xs font-mono text-slate-500">
                      {timer.time}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeTimer(timer.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={handleAddTimer}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-medium hover:bg-slate-50 hover:border-brand-accent/30 hover:text-brand-accent transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                记录当前时间
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <SectionTitle icon={ImageIcon} title="实验图片" />
            <div className="grid grid-cols-2 gap-4">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative flex flex-col gap-2 group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-100">
                    <img src={typeof img === 'string' ? img : img.data} alt="Experiment" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={typeof img === 'string' ? '' : img.caption}
                    onChange={(e) => handleUpdateImageCaption(idx, e.target.value)}
                    placeholder="添加图片备注..."
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-brand-accent/30 outline-none text-slate-600"
                  />
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                <Plus className="w-6 h-6 text-slate-300" />
                <span className="text-xs text-slate-400 mt-2 font-medium">上传图片</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Content & Data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Content Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <SectionTitle icon={FileText} title="实验内容" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">实验目的</label>
                  <textarea 
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none resize-none"
                    placeholder="简述本次实验的核心目标..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">材料与试剂</label>
                    <textarea 
                      name="materials"
                      value={formData.materials}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none resize-none"
                      placeholder="列出所用试剂、纯度、厂家..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">实验设备</label>
                    <textarea 
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none resize-none"
                      placeholder="列出所用仪器型号、参数..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle icon={ClipboardList} title="实验步骤" />
              <div className="space-y-3">
                {formData.steps?.map((step, idx) => (
                  <div key={step.id} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 mt-2 shrink-0">
                      {idx + 1}
                    </div>
                    <input 
                      type="text"
                      value={step.content}
                      onChange={(e) => handleStepChange(step.id, e.target.value)}
                      placeholder={`步骤 ${idx + 1}...`}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={handleAddStep}
                  className="w-full py-2 border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加步骤
                </button>
              </div>
            </div>

            <div>
              <SectionTitle icon={MessageSquare} title="过程记录" />
              <textarea 
                name="process"
                value={formData.process}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
                placeholder="详细记录实验过程中的现象、温度变化、异常情况等..."
              />
            </div>
          </div>

          {/* Data Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <SectionTitle icon={Database} title="实验数据" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase rounded-tl-lg">参数名称</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">数值</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">单位</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase rounded-tr-lg w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.data?.map(row => (
                    <tr key={row.id}>
                      <td className="p-2">
                        <input 
                          type="text"
                          value={row.label}
                          onChange={(e) => handleDataChange(row.id, 'label', e.target.value)}
                          placeholder="例如：反应温度"
                          className="w-full px-3 py-1.5 bg-transparent focus:bg-slate-50 rounded outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text"
                          value={row.value}
                          onChange={(e) => handleDataChange(row.id, 'value', e.target.value)}
                          placeholder="180"
                          className="w-full px-3 py-1.5 bg-transparent focus:bg-slate-50 rounded outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleDataChange(row.id, 'unit', e.target.value)}
                          placeholder="℃"
                          className="w-full px-3 py-1.5 bg-transparent focus:bg-slate-50 rounded outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <button 
                          type="button"
                          onClick={() => handleRemoveDataRow(row.id)}
                          className="p-1 text-slate-300 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              type="button"
              onClick={handleAddDataRow}
              className="w-full py-2 border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加数据行
            </button>
          </div>

          {/* Results & Reflection */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            <div>
              <SectionTitle icon={FileText} title="实验结果总结" />
              <textarea 
                name="results"
                value={formData.results}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
                placeholder="总结实验结果，是否达到预期目标..."
              />
            </div>
            <div>
              <SectionTitle icon={AlertCircle} title="实验反思" />
              <textarea 
                name="reflection"
                value={formData.reflection}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
                placeholder="心得体会、失败原因分析或下一步改进想法..."
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
