import React from 'react';
import { 
  ArrowLeft, Calendar, Tag, Clock, 
  FileText, ClipboardList, Database, 
  MessageSquare, AlertCircle, Share2, 
  ChevronRight, ChevronLeft, Maximize2, X,
  Edit3, Trash2, Check, Copy
} from 'lucide-react';
import { ExperimentRecord } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

import { domToJpeg } from 'modern-screenshot';

interface ExperimentDetailProps {
  experiment: ExperimentRecord;
  onBack: () => void;
  onEdit: (exp: ExperimentRecord) => void;
  onDelete: (id: string) => void;
}

export const ExperimentDetail: React.FC<ExperimentDetailProps> = ({ experiment, onBack, onEdit, onDelete }) => {
  const [selectedImage, setSelectedImage] = React.useState<{ data: string, caption: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showShareToast, setShowShareToast] = React.useState(false);

  const handleShare = async () => {
    const originalElement = document.getElementById('experiment-detail-content');
    if (!originalElement) return;
    
    try {
      // Save current scroll position
      const scrollY = window.scrollY;
      window.scrollTo(0, 0);

      // Temporarily hide the header actions for cleaner screenshot
      const actionsEl = document.getElementById('experiment-detail-actions');
      if (actionsEl) actionsEl.style.display = 'none';

      const captureWidth = 800;

      // Create a clone to modify without affecting the visible UI
      const clonedElement = originalElement.cloneNode(true) as HTMLElement;
      clonedElement.id = 'experiment-detail-content-clone';
      
      // Apply styles to the clone to force single column layout and fix rendering issues
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.zIndex = '-9999';
      clonedElement.style.width = `${captureWidth}px`;
      clonedElement.style.height = 'auto';
      clonedElement.style.minHeight = 'auto';
      clonedElement.style.animation = 'none';
      clonedElement.style.transform = 'none';
      clonedElement.style.backgroundColor = '#f8fafc'; // bg-slate-50
      clonedElement.style.padding = '24px';
      clonedElement.style.paddingBottom = '24px';
      
      // Force single column layout on the clone for better readability and complete rendering
      const mainGrid = clonedElement.querySelector('.lg\\:grid-cols-3');
      if (mainGrid) {
        mainGrid.classList.remove('lg:grid-cols-3');
        mainGrid.classList.add('grid-cols-1');
        (mainGrid as HTMLElement).style.display = 'flex';
        (mainGrid as HTMLElement).style.flexDirection = 'column';
      }
      
      const mainContent = clonedElement.querySelector('.lg\\:col-span-2');
      if (mainContent) {
        mainContent.classList.remove('lg:col-span-2');
        mainContent.classList.add('col-span-1');
      }
      
      const sidebar = clonedElement.querySelector('.lg\\:col-span-1');
      if (sidebar) {
        sidebar.classList.remove('lg:col-span-1');
        sidebar.classList.add('col-span-1');
      }

      const subGrid = clonedElement.querySelector('.md\\:grid-cols-2');
      if (subGrid) {
        subGrid.classList.remove('md:grid-cols-2');
        subGrid.classList.add('grid-cols-1');
      }

      // Hide actions in clone
      const cloneActions = clonedElement.querySelector('#experiment-detail-actions');
      if (cloneActions) (cloneActions as HTMLElement).style.display = 'none';
      
      // Fix sticky header in clone
      const header = clonedElement.querySelector('.sticky');
      if (header) {
        header.classList.remove('sticky', 'top-16');
        (header as HTMLElement).style.position = 'relative';
        (header as HTMLElement).style.top = '0';
        (header as HTMLElement).style.marginBottom = '24px';
      }
      
      // Ensure images are fully visible
      const images = clonedElement.querySelectorAll('img');
      images.forEach(img => {
        img.loading = 'eager';
        img.style.maxWidth = '100%';
        img.style.objectFit = 'contain';
        img.style.height = 'auto';
      });

      // Append clone to body
      document.body.appendChild(clonedElement);

      // Small delay to ensure any pending renders or image decodes are complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await domToJpeg(clonedElement, {
        quality: 0.9,
        scale: 2,
        backgroundColor: '#f8fafc',
        width: captureWidth,
        style: {
          transform: 'none',
          animation: 'none',
          transition: 'none'
        }
      });
      
      // Remove clone
      document.body.removeChild(clonedElement);
      
      if (actionsEl) actionsEl.style.display = 'flex';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${experiment.title}_实验记录.jpg`;
      link.click();
      
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (error) {
      console.error('Failed to generate image', error);
      alert('生成长图失败，请重试');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '已完成': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '已失败': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="experiment-detail-content" className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-16 z-40 bg-brand-secondary/80 backdrop-blur-md py-4 border-b border-slate-200 px-4 md:px-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{experiment.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(experiment.status)}`}>
                {experiment.status}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(experiment.date), 'yyyy年MM月dd日')}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {experiment.type}
              </span>
            </div>
          </div>
        </div>
        <div id="experiment-detail-actions" className="flex gap-2">
          {isDeleting ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <span className="text-xs font-bold text-rose-500">确定删除？</span>
              <button 
                onClick={() => onDelete(experiment.id)}
                className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
                title="确认删除"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsDeleting(false)}
                className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all"
                title="取消"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => onEdit(experiment)}
                className="p-2 text-slate-500 hover:text-brand-accent hover:bg-slate-100 rounded-lg transition-all" 
                title="编辑"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsDeleting(true)}
                className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-all" 
                title="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-2 text-slate-500 hover:text-brand-accent hover:bg-slate-100 rounded-lg transition-all" 
                  title="生成长图"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShareToast && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-[10px] rounded-full whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                    已生成长图并下载
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Experiment Purpose */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-4">
              <FileText className="w-5 h-5" />
              实验目的
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {experiment.purpose || '未填写'}
            </div>
          </section>

          {/* Materials & Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-base mb-3">
                <Database className="w-4 h-4" />
                实验材料
              </div>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {experiment.materials || '未填写'}
              </div>
            </section>
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-base mb-3">
                <Clock className="w-4 h-4" />
                实验设备
              </div>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {experiment.equipment || '未填写'}
              </div>
            </section>
          </div>

          {/* Steps */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-6">
              <ClipboardList className="w-5 h-5" />
              实验步骤
            </div>
            <div className="space-y-4">
              {experiment.steps.map((step, idx) => (
                <div key={step.id} className="flex gap-4 items-start group">
                  <div className="w-7 h-7 rounded-full bg-brand-primary/5 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover:bg-brand-primary group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <div className="text-slate-700 leading-relaxed pt-1">
                    {step.content}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Process Records */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-4">
              <MessageSquare className="w-5 h-5" />
              过程记录
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{experiment.process}</ReactMarkdown>
            </div>
          </section>

          {/* Tips */}
          {experiment.tips && (
            <section className="bg-amber-50/50 p-8 rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-lg mb-4">
                <AlertCircle className="w-5 h-5" />
                实验提示
              </div>
              <div className="text-amber-900 leading-relaxed whitespace-pre-wrap">
                {experiment.tips}
              </div>
            </section>
          )}

          {/* Data Table */}
          {experiment.data.length > 0 && (
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-6">
                <Database className="w-5 h-5" />
                实验数据
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">参数名称</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">数值</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">单位</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {experiment.data.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.label}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{row.value}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Results Summary */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-4">
              <FileText className="w-5 h-5" />
              实验结果总结
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{experiment.results}</ReactMarkdown>
            </div>
          </section>

          {/* Reflection */}
          <section className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-lg mb-4">
              <AlertCircle className="w-5 h-5" />
              实验反思
            </div>
            <div className="text-slate-700 leading-relaxed italic">
              {experiment.reflection || '暂无反思内容'}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">记录信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">创建时间</span>
                <span className="text-slate-600">{format(experiment.createdAt, 'yyyy-MM-dd HH:mm')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">最后更新</span>
                <span className="text-slate-600">{format(experiment.updatedAt, 'yyyy-MM-dd HH:mm')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">实验ID</span>
                <span className="text-slate-600 font-mono text-[10px]">{experiment.id.slice(0, 8)}...</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-2">标签</div>
              <div className="flex flex-wrap gap-2">
                {experiment.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Timers Card */}
          {experiment.timers && experiment.timers.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-accent" />
                时间点记录
              </h3>
              <div className="space-y-3">
                {experiment.timers.map(timer => (
                  <div key={timer.id} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{timer.label}</span>
                    <span className="text-xs font-mono text-slate-500">
                      {timer.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images Card */}
          {experiment.images.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">实验图库</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {experiment.images.map((img, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div 
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-slate-100"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={typeof img === 'string' ? img : img.data} alt={(typeof img !== 'string' && img.caption) || "Experiment"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white w-5 h-5" />
                      </div>
                    </div>
                    {typeof img !== 'string' && img.caption && (
                      <div className="text-xs text-slate-500 text-center px-1 truncate" title={img.caption}>
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
