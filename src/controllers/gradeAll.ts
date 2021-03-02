import { Compiler } from "../utils/Compiler";
import { LanguageMap, validLang } from "../utils/lang";

export default async (req: any, res: any) => {
  const dir = '/home/ketphan02/PhanKiet/Codelynx/docker-compiler/tests';

  const lang = req.query.language;
  const { code, timeout, isMany } = req.query;

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
        true,
      );

      const results = await compiler.gradeCode(dir);

      res.send(results).status(200);
    } catch (err) {
      res.send(err).status(err.code);
    }
  }
}