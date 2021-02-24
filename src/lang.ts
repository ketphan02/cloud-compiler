export interface Language {
  folder: string;
  extension: string;
  execution: string;
}

export const python: Language = {
  folder: 'Python',
  extension: 'py',
  execution: 'python3',
};

export const cpp: Language = {
  folder: 'C++',
  extension: 'cpp',
  execution: 'g++ -Wall',
};

export const javascript: Language = {
  folder: 'Javascript',
  extension: 'js',
  execution: 'node',
};
