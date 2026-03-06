
export type ExperimentStatus = '进行中' | '已完成' | '已失败';

export interface ExperimentStep {
  id: string;
  content: string;
}

export interface ExperimentDataRow {
  id: string;
  label: string;
  value: string;
  unit: string;
}

export interface ExperimentTimer {
  id: string;
  label: string;
  time: string;
}

export interface ExperimentImage {
  data: string;
  caption: string;
}

export interface ExperimentRecord {
  id: string;
  title: string;
  date: string;
  type: string;
  tags: string[];
  status: ExperimentStatus;
  purpose: string;
  materials: string;
  equipment: string;
  steps: ExperimentStep[];
  process: string;
  data: ExperimentDataRow[];
  results: string;
  images: ExperimentImage[]; // Base64 strings with captions
  reflection: string;
  timers?: ExperimentTimer[];
  createdAt: number;
  updatedAt: number;
}

export interface LiteratureRecord {
  id: string;
  title: string;
  author: string;
  year: string;
  doi: string;
  process: string;
  results: string;
  conditions: string;
  images?: ExperimentImage[];
  notes: string;
  createdAt: number;
}

export interface AppState {
  experiments: ExperimentRecord[];
  literature: LiteratureRecord[];
  templates: Partial<ExperimentRecord>[];
}
