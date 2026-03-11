import localforage from 'localforage';
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
  save: async (state: AppState) => {
    try {
      await localforage.setItem(STORAGE_KEY, state);
    } catch (e) {
      console.error('Failed to save state to localforage', e);
    }
  },
  load: async (): Promise<AppState> => {
    try {
      const data = await localforage.getItem<AppState>(STORAGE_KEY);
      if (!data) {
        // Fallback to localStorage for backward compatibility
        const oldData = localStorage.getItem(STORAGE_KEY);
        if (oldData) {
          try {
            const parsed = JSON.parse(oldData);
            return { ...DEFAULT_STATE, ...parsed };
          } catch (e) {
            return DEFAULT_STATE;
          }
        }
        return DEFAULT_STATE;
      }
      return { ...DEFAULT_STATE, ...data };
    } catch (e) {
      console.error('Failed to load state from localforage', e);
      return DEFAULT_STATE;
    }
  }
};
