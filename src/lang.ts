export interface Language {
  folder: string;
  build?: string;
  buildFile?: string;
  execution: string;
  executionFile?: string;
}

export type validLang = 'python' | 'javascript' | 'cpp';

const python: Language = {
  folder: 'Python',
  execution: 'python3 app.py',
  executionFile: 'app.py',
};

const cpp: Language = {
  folder: 'C++',
  build: 'make app',
  buildFile: 'app.cpp',
  execution: './app',
};

const javascript: Language = {
  folder: 'Javascript',
  execution: 'node app.js',
  executionFile: 'app.js',
};

export const LanguageMap = {
  'python': python,
  'javascript': javascript,
  'cpp': cpp,
}