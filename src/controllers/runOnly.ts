import { validLang } from "../utils/lang";
import { runCompiler } from "./runCompiler";

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
    (typeof timeout === 'string' || typeof timeout === 'number') &&
    testcases
  ) {
    const result = await runCompiler(
      language,
      code,
      typeof timeout === 'string' ? parseInt(timeout) : timeout,
      undefined,
      testcases,
    );

    res.send(result).status(200);
  } else if (
    language &&
    typeof code === 'string' &&
    (typeof timeout === 'string' || typeof timeout === 'number') &&
    typeof req.query.input === 'string'
  ) {
    const result = await runCompiler(
      language,
      code,
      typeof timeout === 'string' ? parseInt(timeout) : timeout,
      req.query.input,
      undefined,
    );

    if (!Array.isArray(result)) {
      if (result.exitCode === 0) res.send(result).status(200);
      else res.send('Error: code ' + result.exitCode).status(result.exitCode);
    }
  } else res.sendStatus(404);
}