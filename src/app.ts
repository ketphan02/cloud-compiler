import { Compiler } from './Compiler';
import { languageMap } from './lang';
import * as shell from 'shelljs';

const data = `n = input()\nprint(n)`;
const inp = '2020 1 1';
const language = 'python';

/**
 * Dummy inputs
 */
const inputDummies = () => {
    for (let i = 1; i <= 100; ++i) {
      shell.mkdir('-p', process.cwd() + '/tmp/sample/' + i.toString());
      shell
        .ShellString(i.toString())
        .to(process.cwd() + '/tmp/sample/' + i.toString() + '/' + i.toString() + '.inp');
    }
  };
  


const compiler = new Compiler(languageMap[language], data, 1, true);

// compiler.executeOne(inp)

inputDummies();

compiler.executeMany(process.cwd() + '/tmp/sample/');