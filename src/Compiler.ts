import { Language } from './lang';
import * as shell from 'shelljs';

export class Compiler {
  private code: string;
  private language: Language;
  private folderPath: string;
  private outDir: string = (__dirname +  '/Template/outputsFolder/custom.out').slice();
  private inpDir: string = '';
  private executeScript: string = 'echo "Nothing has been decleared yet"';
  private isMany: boolean;
  private timeout = 1;
  readonly bashRun = (__dirname + '/Template/executeOne.sh').slice();

  constructor(
    language: Language,
    code: string,
    timeout: number,
    isMany: boolean,
  ) {
    this.language = language;
    this.code = code;
    this.timeout = timeout;
    this.isMany = isMany;

    this.folderPath = '/tmp/compile/' + this.language.folder + '/';
    shell.mkdir('-p', this.folderPath);

  }

  /**
   * Copy code to particular folder
   */
  private prepare = async (customInp?: string) => {

    await shell.mkdir('-p', this.folderPath);
    await shell.cd(this.folderPath);
    if (customInp) {
      await shell.mkdir('-p', this.folderPath + 'inputsFolder/');
      this.inpDir = this.folderPath + 'inputsFolder/custom.inp';

      await shell.ShellString(customInp).to(this.inpDir);
    }

    if (this.language.build && this.language.buildFile) {
      await shell.ShellString(this.code).to(this.language.buildFile);
      const buildReturn = await this.buildFile();
      if (buildReturn !== 0) return buildReturn;
    }
    else if (this.language.executionFile)
      await shell.ShellString(this.code).to(this.language.executionFile);
  };

  /**
   * Clean dir after executing script
   */
  private clean = async () => {
    await shell.rm('-f', this.folderPath + 'app.*');
    await shell.rm('-f', this.folderPath + 'inputsFolder/*.inp')
  };

  private buildFile = async () => {
    if (!this.language.build) return 2;

    this.executeScript = this.language.build;
    console.log(this.executeScript);

    const exitCode = (await shell.exec(this.executeScript)).code;

    return exitCode;
  };

  /**
   * Execute the code
   */
  public executeOne = async (customInp?: string) => {
    if (this.isMany) return {
      exitCode: 403,
      value: 'Forbiden',
    };

    if (customInp !== undefined) await this.prepare(customInp);

    // Execute running command
    this.executeScript =
      'timeout ' + this.timeout +
      ' ' + this.bashRun + 
      ' ' + this.outDir +
      ' ' + this.inpDir +
      ' ' + this.folderPath +
      ' ' + this.language.execution;

    const result = await shell.exec(this.executeScript);
    const exitCode = result.code;
    const stdout = (await shell.cat(this.outDir)).stdout;

    if (customInp !== undefined) await this.clean();

    return {
      exitCode: exitCode,
      value: stdout
    }
  };

  public executeMany = async (workingFolder: string) => {
    if (!this.isMany) return {
      exitCode: 403,
      result: [],
    };

    await this.prepare();

    const runningResults = [];

    const testFolders = shell.ls(workingFolder).stdout.split('\n');
    this.isMany = false;
    for (let i = 1; i <= testFolders.length - 1; ++i) {
      console.log('Running test ' + i);
      
      this.inpDir = workingFolder + i + '/' + i + '*.inp';
      await shell.rm('-f', workingFolder + i + '/' + '*.out');
      this.outDir = workingFolder + i + '/' + i + '.out';
      
      const res = await this.executeOne();

      if (res.exitCode === 124) {
        return {
          exitCode: 124,
          result: [],
        }
      }
      else if (res.exitCode === 403) {
        return {
          exitCode: 403,
          result: []
        }
      }
      else if (res.exitCode === 0) runningResults.push(res.value);
    }

    this.isMany = true;
    await this.clean();

    return {
      exitCode: 0,
      result: runningResults,
    }
  };
}
