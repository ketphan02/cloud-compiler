import { Compiler } from '../utils/Compiler';
import { LanguageMap, Language, validLang } from '../utils/lang';

export const runCompiler = async (
  language: validLang,
  code: string,
  timeout: number,
  input?: string,
  testcases?: Array<{ input: string; output?: string }>,
) => {
  const compiler = new Compiler(LanguageMap[language], code, timeout);

  if (testcases) {
      const result = await compiler.executeMany(testcases);
      return result;
  } else if (input) {
      const result = await compiler.executeOne(input);
      return result;
  }

  return {
    exitCode: 2,
    value: 'Not found input',
  };
};
