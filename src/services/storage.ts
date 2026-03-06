import { AppState, ExperimentRecord, LiteratureRecord } from '../types';

const STORAGE_KEY = 'lab_notebook_data';

const DEFAULT_STATE: AppState = {
  experiments: [],
  literature: [],
  templates: [
    {
      title: '光催化实验模板',
      type: '光催化',
      purpose: '探究不同催化剂在可见光下的降解效率',
      materials: '催化剂、目标降解物、去离子水',
      equipment: '氙灯光源、反应器、紫外可见分光光度计',
      steps: [
        { id: '1', content: '配置降解液' },
        { id: '2', content: '加入催化剂并避光搅拌达到吸附平衡' },
        { id: '3', content: '开启光源，定时取样' }
      ]
    },
    {
      title: '材料合成模板',
      type: '材料合成',
      purpose: '通过水热法合成纳米材料',
      materials: '前驱体、溶剂、表面活性剂',
      equipment: '反应釜、烘箱、离心机',
      steps: [
        { id: '1', content: '溶解前驱体' },
        { id: '2', content: '调节pH值' },
        { id: '3', content: '转移至反应釜并加热' }
      ]
    }
  ]
};

export const storage = {
  save: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    try {
      const parsed = JSON.parse(data);
      // Ensure templates are always present
      return { ...DEFAULT_STATE, ...parsed };
    } catch (e) {
      return DEFAULT_STATE;
    }
  },
  addExperiment: (exp: ExperimentRecord) => {
    const state = storage.load();
    state.experiments.unshift(exp);
    storage.save(state);
  },
  updateExperiment: (exp: ExperimentRecord) => {
    const state = storage.load();
    state.experiments = state.experiments.map(e => e.id === exp.id ? exp : e);
    storage.save(state);
  },
  deleteExperiment: (id: string) => {
    const state = storage.load();
    state.experiments = state.experiments.filter(e => e.id !== id);
    storage.save(state);
  },
  addLiterature: (lit: LiteratureRecord) => {
    const state = storage.load();
    state.literature.unshift(lit);
    storage.save(state);
  },
  updateLiterature: (lit: LiteratureRecord) => {
    const state = storage.load();
    state.literature = state.literature.map(l => l.id === lit.id ? lit : l);
    storage.save(state);
  },
  deleteLiterature: (id: string) => {
    const state = storage.load();
    state.literature = state.literature.filter(l => l.id !== id);
    storage.save(state);
  }
};
