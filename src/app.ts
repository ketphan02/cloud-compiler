import { Compiler } from './Compiler';
import { LanguageMap, Language, validLang } from './lang';

const useLang: validLang = 'cpp';
const useCodeCpp = '#include <iostream>\nusing namespace std;\nint main() {\n\tint n; cin >> n; cout << n;\n}\n';
const useCodePython = 'n = input()\nprint(n)'
const useTimeout = 1;
const useIsMany = false;

export const runCompiler = async (language: validLang, code: string, timeout: number, isMany: boolean, input?: string, inputsDir?: string): (Promise<string[] | string | undefined>) => {

    const compiler = new Compiler(LanguageMap[language], code, timeout, isMany);

    if (isMany) {
        if (inputsDir) {
            const result = (await compiler.executeMany(inputsDir)).result;
            return result;
        }
    }
    else {
        if (input) {
            const result = (await compiler.executeOne(input)).value;
            return result;
        }
    }
}