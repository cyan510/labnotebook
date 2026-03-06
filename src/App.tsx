import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExperimentList } from './components/ExperimentList';
import { ExperimentForm } from './components/ExperimentForm';
import { ExperimentDetail } from './components/ExperimentDetail';
import { LiteratureList, LiteratureForm } from './components/LiteratureList';
import { ComparisonView } from './components/ComparisonView';
import { storage } from './services/storage';
import { ExperimentRecord, LiteratureRecord, AppState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appState, setAppState] = useState<AppState>(storage.load());
  const [viewingExperiment, setViewingExperiment] = useState<ExperimentRecord | null>(null);
  const [editingExperiment, setEditingExperiment] = useState<ExperimentRecord | null>(null);
  const [editingLiterature, setEditingLiterature] = useState<LiteratureRecord | null>(null);
  const [isAddingLiterature, setIsAddingLiterature] = useState(false);

  // Sync state to storage whenever it changes
  useEffect(() => {
    storage.save(appState);
  }, [appState]);

  const handleSaveExperiment = (exp: ExperimentRecord) => {
    setAppState(prev => {
      const exists = prev.experiments.some(e => e.id === exp.id);
      if (exists) {
        return {
          ...prev,
          experiments: prev.experiments.map(e => e.id === exp.id ? exp : e)
        };
      } else {
        return {
          ...prev,
          experiments: [exp, ...prev.experiments]
        };
      }
    });
    setEditingExperiment(null);
    setActiveTab('library');
  };

  const handleDeleteExperiment = (id: string) => {
    setAppState(prev => ({
      ...prev,
      experiments: prev.experiments.filter(e => e.id !== id)
    }));
  };

  const handleSaveLiterature = (lit: LiteratureRecord) => {
    setAppState(prev => {
      const exists = prev.literature.some(l => l.id === lit.id);
      if (exists) {
        return {
          ...prev,
          literature: prev.literature.map(l => l.id === lit.id ? lit : l)
        };
      } else {
        return {
          ...prev,
          literature: [lit, ...prev.literature]
        };
      }
    });
    setEditingLiterature(null);
    setIsAddingLiterature(false);
  };

  const handleDeleteLiterature = (id: string) => {
    setAppState(prev => ({
      ...prev,
      literature: prev.literature.filter(l => l.id !== id)
    }));
  };

  const renderContent = () => {
    // Detail view takes precedence
    if (viewingExperiment) {
      return (
        <ExperimentDetail 
          experiment={viewingExperiment} 
          onBack={() => setViewingExperiment(null)} 
          onEdit={(exp) => {
            setViewingExperiment(null);
            setEditingExperiment(exp);
          }}
          onDelete={(id) => {
            handleDeleteExperiment(id);
            setViewingExperiment(null);
          }}
        />
      );
    }

    // Edit view
    if (editingExperiment) {
      return (
        <ExperimentForm 
          initialData={editingExperiment}
          onSave={handleSaveExperiment}
          onCancel={() => setEditingExperiment(null)}
        />
      );
    }

    // Literature Form
    if (isAddingLiterature || editingLiterature) {
      return (
        <LiteratureForm 
          initialData={editingLiterature || undefined}
          onSave={handleSaveLiterature}
          onCancel={() => {
            setIsAddingLiterature(false);
            setEditingLiterature(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            experiments={appState.experiments}
            literature={appState.literature}
            onAddNew={() => setActiveTab('new-experiment')}
            onViewExperiment={setViewingExperiment}
            onViewLibrary={() => setActiveTab('library')}
            onViewLiterature={() => setActiveTab('literature')}
          />
        );
      case 'new-experiment':
        return (
          <ExperimentForm 
            onSave={handleSaveExperiment}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'library':
        return (
          <ExperimentList 
            experiments={appState.experiments}
            onView={setViewingExperiment}
            onEdit={setEditingExperiment}
            onDelete={handleDeleteExperiment}
            onAddNew={() => setActiveTab('new-experiment')}
          />
        );
      case 'literature':
        return (
          <LiteratureList 
            literature={appState.literature}
            onAdd={() => setIsAddingLiterature(true)}
            onEdit={setEditingLiterature}
            onDelete={handleDeleteLiterature}
          />
        );
      case 'comparison':
        return <ComparisonView experiments={appState.experiments} />;
      default:
        return <Dashboard 
          experiments={appState.experiments} 
          literature={appState.literature}
          onAddNew={() => setActiveTab('new-experiment')}
          onViewExperiment={setViewingExperiment}
          onViewLibrary={() => setActiveTab('library')}
          onViewLiterature={() => setActiveTab('literature')}
        />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-secondary">
      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setViewingExperiment(null);
        setEditingExperiment(null);
        setEditingLiterature(null);
        setIsAddingLiterature(false);
      }} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} 掌控我的实验 - 电子实验记录本 (ELN)
          </p>
          <p className="text-slate-300 text-[10px] mt-1">
            数据存储于本地浏览器 (LocalStorage)
          </p>
        </div>
      </footer>
    </div>
  );
}
