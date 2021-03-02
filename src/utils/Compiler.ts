import { Language } from './lang';
import * as shell from 'shelljs';
import * as fs from 'fs';

export class Compiler {
  private code: string;
  private language: Language;
  private folderPath: string;
  private outPath: string = '/tmp/compile/';
  private outDir: string = '/tmp/compile/temp.out';
  private inpDir: string = '';
  private executeScript: string = 'echo "Nothing has been decleared yet"';
  private isMany: boolean;
  private timeout = 1;
  readonly bashRun = (__dirname + '/../Template/executeOne.sh').slice();

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

      await shell.mkdir('-p', this.outPath);
      await shell.touch(this.outDir);
    }

    if (this.language.build && this.language.buildFile) {
      await shell.ShellString(this.code).to(this.language.buildFile);
      const buildReturn = await this.buildFile();
      if (buildReturn !== 0) return buildReturn;
    } else if (this.language.executionFile)
      await shell.ShellString(this.code).to(this.language.executionFile);
  };

  /**
   * Clean dir after executing script
   */
  private clean = async () => {
    await shell.rm('-f', this.folderPath + 'app.*');
    await shell.rm('-f', this.folderPath + 'inputsFolder/*.inp');
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
    if (this.isMany)
      return {
        exitCode: 403,
        value: 'Forbiden',
        runTime: -1,
      };

    if (customInp !== undefined) await this.prepare(customInp);

    // Execute running command
    this.executeScript =
      'timeout ' +
      this.timeout +
      ' ' +
      this.bashRun +
      ' ' +
      this.outDir +
      ' ' +
      this.inpDir +
      ' ' +
      this.folderPath +
      ' ' +
      this.language.execution;

    const result = await shell.exec(this.executeScript);
    const exitCode = result.code;
    const stdout = (await shell.cat(this.outDir)).stdout.trim();
    const runTime = stdout.slice(stdout.lastIndexOf('\n') + 1);

    if (customInp !== undefined) await this.clean();

    return {
      exitCode: exitCode,
      value: stdout.replace('\n' + runTime, ''),
      runTime: runTime, // This key is for further usage
    };
  };

  /**
   * Only run and see the results of the codes, this will not validate the results.
   * @param inputsFolder the
   */
  public executeMany = async (inputsFolder: string) => {
    if (!this.isMany)
      return {
        exitCode: 403,
        value: [],
      };

    await this.prepare();

    const runningResults = [];

    const testFolders = shell.ls(inputsFolder).stdout.split('\n'); // Remove with mongoose
    this.isMany = false;
    for (let i = 1; i <= testFolders.length - 1; ++i) {

      this.inpDir = inputsFolder + i + '/' + i + '*.inp';

      const res = await this.executeOne();

      if (res.exitCode === 124) {
        runningResults.push('[COMPILER]\NRUN TIME ERROR');
        return {
          exitCode: 124,
          value: runningResults,
        };
      } else if (res.exitCode === 0) runningResults.push(res.value);
    }
    this.isMany = true;
    await this.clean();

    return {
      exitCode: 0,
      value: runningResults,
    };
  };

  /**
   * This will run the code for every input while validating each ouput.
   * @param expectedOutputsFolder the folder containing the epected output.
   * @param inputsFolder
   */
  public gradeCode = async ( testcasesFolder: string ) => {

    /**
     * START: Remove with mongoose
     */
    const expectedOutputs: string[] = [];
    const testCases = fs.readdirSync(testcasesFolder);
    testCases.forEach((testCase) =>
      expectedOutputs.push(
        shell
          .cat(testcasesFolder + '/' + testCase + '/*.out')
          .stdout.trim(),
      ),
    );
    /**
     * STOP 
     */

    if (!this.isMany)
      return {
        exitCode: 403,
        value: [],
      };

    await this.prepare();

    const runningResults = [];

    const testFolders = shell.ls(testcasesFolder).stdout.split('\n');
    this.isMany = false;
    for (let i = 0; i < testFolders.length - 1; ++i) {
      this.inpDir = testcasesFolder + '/' + i + '/' + '*.inp'; // Remove with mongoose
      const expectedOutput = shell.cat(testcasesFolder + '/' + i + '/' + '*.out').stdout.trim(); // Remove with mongoose

      const res = await this.executeOne();

      if (res.exitCode === 124) {
        runningResults.push('TLE');
        return {
          exitCode: 124,
          value: runningResults,
        };
      } else if (res.exitCode === 0) runningResults.push(this.checkOutput(res.value, expectedOutput) ? "OK": "WA");
    }
    this.isMany = true;
    await this.clean();

    return {
      exitCode: 0,
      value: runningResults,
    };
  };


  // This is isolated because this can be modified to handle more complex cases.
  private checkOutput(output: string, expectedOutput: string) {

    if (output === expectedOutput) return true;

    return false;
  }
}
