import { Compiler } from "../utils/Compiler";
import { LanguageMap, validLang } from "../utils/lang";

export default async (req: any, res: any) => {

  const lang = req.query.language;
  const { code, timeout, testcases } = req.query;

  let language: validLang | undefined;

  switch (lang) {
    case 'python':
      language = 'python';
      break;
    case 'javascript':
      language = 'javascript';
      break;
    case 'cpp':
      language = 'cpp';
      break;
    default:
      language = undefined;
  }

  if (
    language &&
    typeof code === 'string' &&
    (typeof timeout === 'string' || typeof timeout === 'number')
  ) {
    try {
      const compiler = new Compiler(
        LanguageMap[language],
        code,
        typeof timeout === 'string' ? parseInt(timeout) : timeout,
      );

      const results = await compiler.gradeCode(testcases);

      res.send(results).status(200);
    } catch (err) {
      res.send(err).status(err.code);
    }
  }
}