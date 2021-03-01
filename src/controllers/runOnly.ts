import { validLang } from "../utils/lang";
import { runCompiler } from "../utils/runCompiler";

export default async (req: any, res: any) => {
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
    (typeof timeout === 'string' || typeof timeout === 'number') &&
    isMany === 'true' &&
    typeof req.query.inputsDir === 'string'
  ) {
    const result = await runCompiler(
      language,
      code,
      typeof timeout === 'string' ? parseInt(timeout) : timeout,
      true,
      undefined,
      req.query.inputsDir,
    );

    if (!isError(result.exitCode)) res.send(result.value).status(200);
    else res.send('Error: code ' + result.exitCode).status(result.exitCode);
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
      false,
      req.query.input,
      undefined,
    );

    if (!isError(result.exitCode)) res.send(result.value).status(200);
    else res.send('Error: code ' + result.exitCode).status(result.exitCode);
  } else res.sendStatus(404);
}

const isError = (exitCode: number) => {
    if (exitCode !== 0) return true;
    return false;
};