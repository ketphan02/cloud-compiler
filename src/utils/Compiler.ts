import * as shell from 'shelljs';

import { Language } from './lang';

export class Compiler {
  private code: string;
  private language: Language;
  private executeScript: string = 'echo "Nothing has been decleared yet"';
  private timeout = 1;
  readonly bashRun = (__dirname + '/../executeOne.sh').slice();

  // Temporary files
  private tempPath: string = '/tmp/compile/';
  private outDir: string = '/tmp/compile/temp.out';
  private inpDir: string = '/tmp/compile/temp.inp';

  constructor(
    language: Language,
    code: string,
    timeout: number,
  ) {
    this.language = language;
    this.code = code;
    this.timeout = timeout;
  }

  /** 
   * Compile files that require building before executing.
   */
  private buildFile = async () => {
    // Code 2: No file found.
    if (!this.language.build) return 2;

    const exitCode = (await shell.exec(this.language.build)).code;

    return exitCode;
  };

  /**
   * Copy code to particular folder
   */
  private prepare = async (inp?: string) => {

    // Run one time only (before )
    if (inp !== undefined) {
      // Create a folder to run
      await shell.mkdir('-p', this.tempPath);
      await shell.cd(this.tempPath);

      // Create temperary input and output file
      await shell.touch(this.inpDir);
      await shell.touch(this.outDir);

    // Write the input into the input temp file (inp will be undefined if preparing for multiple files).
      await shell.ShellString(inp).to(this.inpDir);
    }

    // Build file if need to build (this will create a executable file).
    if (this.language.build && this.language.buildFile) {
      await shell.ShellString(this.code).to(this.language.buildFile);
      const buildReturn = await this.buildFile();
      if (buildReturn !== 0) return buildReturn;
    }
    // Write the code to the temp app file
    else if (this.language.executionFile) {
      await shell.ShellString(this.code).to(this.language.executionFile);
    }
  };

  /**
   * Clean dir after executing script
   */
  private clean = async () => {
    await shell.rm('-f', this.tempPath + 'app.*');
    await shell.rm('-f', this.tempPath + '*.inp');
    await shell.rm('-f', this.tempPath + '*.out');
  };

  /**
   * Execute the code
   * @param inp the custom input written by the user
   * @param isCreated to control if the temporary files have been created. (default value is false)
   */
  public executeOne = async (input: string, isCreated: boolean = false): Promise<{exitCode: number, value: string, runTime: number}> => {

    if (!isCreated) await this.prepare(input);

    // Execute running command
    // This script will write the input & runtime into the temporary output file.
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
      this.tempPath +
      ' ' +
      this.language.execution;

      // This block execute the script and get the exitcode + stdout
    const result = await shell.exec(this.executeScript);
    const exitCode = result.code;
    const output = (await shell.cat(this.outDir)).stdout.trim();
    const runTime = output.slice(output.lastIndexOf('\n') + 1);

    // Clear the directory
    if (!isCreated) await this.clean();

    return {
      exitCode: exitCode,
      value: output.replace('\n' + runTime, ''), // Cut out the last line (runtime)
      runTime: parseFloat(runTime), // This key is for further usage
    };
  };

  /**
   * Only run and see the results of the codes, this will not validate the results.
   * @param inputsFolder the
   */
  public executeMany = async (testcases: Array<{input: string, output?: string}>): Promise<(Array<{exitCode: number, value: string, runTime: number}>)> => {

    // Prepare the directory
    await this.prepare();

    const runningResults: Array<{exitCode: number, value: string, runTime: number}> = [];

    testcases.forEach( async (testcase: {input: string, output?: string}) => {
      const res = await this.executeOne(testcase.input, true);

      // Check run time error
      if (res.exitCode === 124) {
        runningResults.push({
          exitCode: res.exitCode,
          value: '[RUN TIME ERROR]',
          runTime: -1,
        });
      } // Other errors
      else if (res.exitCode) {
        runningResults.push({
          exitCode: res.exitCode,
          value: '[ERROR]: Code ' + res.exitCode.toString(),
          runTime: 0,
        });
      } // Push the results to result array
      else if (res.exitCode === 0) runningResults.push({
        exitCode: 0,
        value: res.value,
        runTime: res.runTime,
      });
    });

    // Clean the directory
    await this.clean();

    return runningResults;
  };

  /**
   * This will run the code for every input while validating each ouput.
   * @param expectedOutputsFolder the folder containing the epected output.
   * @param inputsFolder
   */
  public gradeCode = async ( testcases: Array<{input: string, output: string, runTime: number}> ): Promise<(Array<{exitCode: number, value: string, runTime: number}>)> => {

    await this.prepare();

    const runningResults: Array<{exitCode: number, value: string, runTime: number}> = [];

    testcases.forEach( async (testcase: {input: string, output: string}) => {
      const res = await this.executeOne(testcase.input, true);

      // Check run time error
      if (res.exitCode === 124) {
        runningResults.push({
          exitCode: res.exitCode,
          value: 'TLE',
          runTime: -1,
        });
      } // Other errors
      else if (res.exitCode) {
        runningResults.push({
          exitCode: res.exitCode,
          value: 'ERR',
          runTime: 0,
        });
      } // Push the results to result array
      else if (res.exitCode === 0) runningResults.push({
        exitCode: 0,
        // Check if output and runnning result are equal
        value: this.grade(res.value, testcase.output) ? 'TLE': 'WA',
        runTime: res.runTime,
      });
    });

    // Clean the directory
    await this.clean();

    return runningResults;
  };


  // This is isolated because this can be modified to handle more complex cases.
  private grade(output: string, expectedOutput: string): boolean {

    if (output === expectedOutput) return true;

    return false;
  }
}
