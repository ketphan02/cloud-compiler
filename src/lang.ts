export interface Language {
  folder: string;
  extension: string;
  execution: string;
}

const python: Language = {
  folder: 'Python',
  extension: 'py',
  execution: 'python3',
};

const cpp: Language = {
  folder: 'C++',
  extension: 'cpp',
  execution: 'g++ -Wall',
};

const javascript: Language = {
  folder: 'Javascript',
  extension: 'js',
  execution: 'node',
};

export const languageMap = {
  'python': python,
  'cpp': python,
  'javascript': javascript,
}