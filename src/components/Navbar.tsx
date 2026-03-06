import React from 'react';
import { LayoutDashboard, PlusCircle, Library, BookOpen, BarChart2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: '首页', icon: LayoutDashboard },
    { id: 'new-experiment', label: '新建实验', icon: PlusCircle },
    { id: 'library', label: '实验记录库', icon: Library },
    { id: 'literature', label: '文献实验库', icon: BookOpen },
    { id: 'comparison', label: '条件对比', icon: BarChart2 },
  ];

  return (
    <nav className="bg-brand-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-white p-1 rounded">
              <BookOpen className="text-brand-primary w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">掌控我的实验</span>
          </div>
          
          <div className="flex gap-1 sm:gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:block">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
