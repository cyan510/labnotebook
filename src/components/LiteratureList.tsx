import React from 'react';
import { 
  Plus, Search, BookOpen, ExternalLink, 
  Trash2, Edit3, Calendar, User, Hash, 
  FileText, ClipboardList, Info, Save, X,
  Image as ImageIcon, Maximize2
} from 'lucide-react';
import { LiteratureRecord } from '../types';
import { format } from 'date-fns';

import { compressImage } from '../utils/image';

interface LiteratureListProps {
  literature: LiteratureRecord[];
  onAdd: () => void;
  onEdit: (lit: LiteratureRecord) => void;
  onDelete: (id: string) => void;
}

const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`p-2 rounded-lg transition-all flex items-center gap-1 ${
        confirmDelete 
        ? 'bg-rose-500 text-white px-3 text-xs font-bold animate-pulse' 
        : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
      }`}
    >
      <Trash2 className="w-4 h-4" />
      {confirmDelete && "确定删除？"}
    </button>
  );
};

export const LiteratureList: React.FC<LiteratureListProps> = ({ literature, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState<{ data: string, caption: string } | null>(null);

  const filteredLit = literature.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.author.toLowerCase().includes(search.toLowerCase()) ||
    l.notes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="搜索文献标题、作者或笔记..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={onAdd}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Plus className="w-4 h-4" />
          添加文献
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredLit.length > 0 ? (
          filteredLit.map(lit => (
            <div key={lit.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-accent transition-colors">
                      {lit.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {lit.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {lit.year}
                      </span>
                      {lit.doi && (
                        <a 
                          href={lit.doi.startsWith('http') ? lit.doi : `https://doi.org/${lit.doi}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-accent hover:underline"
                        >
                          <Hash className="w-4 h-4" />
                          DOI/链接
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(lit)}
                      className="p-2 text-slate-400 hover:text-brand-accent hover:bg-slate-50 rounded-lg"
                      title="编辑"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <DeleteButton onDelete={() => onDelete(lit.id)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <ClipboardList className="w-3 h-3" />
                      实验流程
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">{lit.process}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <FileText className="w-3 h-3" />
                      实验结果
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">{lit.results}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <Info className="w-3 h-3" />
                      关键条件
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">{lit.conditions}</p>
                  </div>
                </div>

                {lit.images && lit.images.length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-3">文献配图</div>
                    <div className="flex flex-wrap gap-3">
                      {lit.images.map((img, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <div 
                            className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group border border-slate-100"
                            onClick={() => setSelectedImage(img)}
                          >
                            <img src={typeof img === 'string' ? img : img.data} alt={(typeof img !== 'string' && img.caption) || "Literature"} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="text-white w-4 h-4" />
                            </div>
                          </div>
                          {typeof img !== 'string' && img.caption && (
                            <div className="text-[10px] text-slate-500 text-center w-24 truncate" title={img.caption}>
                              {img.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lit.notes && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">我的笔记</div>
                    <p className="text-sm text-slate-700 italic">{lit.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
            <BookOpen className="text-slate-300 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-slate-800 font-semibold mb-1">暂无文献记录</h3>
            <p className="text-slate-500 text-sm mb-6">记录您阅读过的科研文献实验流程</p>
            <button 
              onClick={onAdd}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-primary/90 transition-all shadow-md"
            >
              立即添加
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
            <X className="w-8 h-8" />
          </button>
          <img 
            src={typeof selectedImage === 'string' ? selectedImage : selectedImage.data} 
            alt={(typeof selectedImage !== 'string' && selectedImage.caption) || "Full size"} 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
          {typeof selectedImage !== 'string' && selectedImage.caption && (
            <div className="text-white mt-4 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {selectedImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface LiteratureFormProps {
  initialData?: Partial<LiteratureRecord>;
  onSave: (data: LiteratureRecord) => void;
  onCancel: () => void;
}

export const LiteratureForm: React.FC<LiteratureFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState<Partial<LiteratureRecord>>({
    id: initialData?.id || crypto.randomUUID(),
    title: initialData?.title || '',
    author: initialData?.author || '',
    year: initialData?.year || new Date().getFullYear().toString(),
    doi: initialData?.doi || '',
    process: initialData?.process || '',
    results: initialData?.results || '',
    conditions: initialData?.conditions || '',
    images: initialData?.images || [],
    notes: initialData?.notes || '',
    createdAt: initialData?.createdAt || Date.now(),
  });
  const [isUploading, setIsUploading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsUploading(true);
      try {
        for (const file of Array.from(files)) {
          try {
            const dataUrl = await compressImage(file);
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), { data: dataUrl, caption: '' }]
            }));
          } catch (error) {
            console.error('Error compressing image:', error);
            alert('图片处理失败，请重试');
          }
        }
      } finally {
        setIsUploading(false);
      }
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
      alert('请输入文献标题');
      return;
    }
    onSave(formData as LiteratureRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between sticky top-16 z-40 bg-brand-secondary/80 backdrop-blur-md py-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData?.id ? '编辑文献记录' : '添加文献记录'}
        </h2>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
            取消
          </button>
          <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-md">
            <Save className="w-4 h-4" />
            保存文献
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">文献标题 *</label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
              placeholder="文献全称..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">作者</label>
            <input 
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
              placeholder="第一作者等..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">发表年份</label>
              <input 
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">DOI / 链接</label>
              <input 
                type="text"
                name="doi"
                value={formData.doi}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 outline-none"
                placeholder="10.1038/..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">文献实验流程</label>
            <textarea 
              name="process"
              value={formData.process}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
              placeholder="描述论文中的实验步骤..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">文献实验结果</label>
            <textarea 
              name="results"
              value={formData.results}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
              placeholder="描述论文中的主要结果和数据..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">关键实验条件</label>
            <textarea 
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
              placeholder="例如：温度、浓度、反应时间等核心参数..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">文献配图</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative flex flex-col gap-2 group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-100">
                    <img src={typeof img === 'string' ? img : img.data} alt="Literature" className="w-full h-full object-cover" />
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
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400 mb-2"></div>
                    <span className="text-xs text-slate-400 font-medium">处理中...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-slate-300" />
                    <span className="text-xs text-slate-400 mt-2 font-medium">上传图片</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">我的理解 / 笔记</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent/20 outline-none"
              placeholder="记录阅读后的启发、疑问或与自己实验的关联..."
            />
          </div>
        </div>
      </div>
    </form>
  );
};
