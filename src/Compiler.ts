import { Language } from './lang';
import * as shell from 'shelljs';

export class Compiler {
  private code: string;
  private language: Language;
  private folderPath: string;
  private appDir: string;
  private outDir: string;
  private inpDir: string;
  private executeScript: string;
  private isMany: boolean;
  private timeout = 1;

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
    this.appDir = this.folderPath + 'app.' + this.language.extension;

    // Mock data
    this.executeScript = 'echo "Nothing has been decleared yet"';
    this.outDir = process.cwd() + '/tmp/outputsFolder/custom.out';
    this.inpDir = '';
  }

  /**
   * Copy code to particular folder
   */
  private prepare = async (customInp?: string) => {
    await shell.mkdir('-p', this.folderPath);
    await shell.ShellString(this.code).to(this.appDir);
    if (customInp) {
      await shell.mkdir('-p', this.folderPath + 'inputsFolder');
      this.inpDir = this.folderPath + 'inputsFolder/custom.inp';
      await shell.ShellString(customInp).to(this.inpDir);
    }
  };

  /**
   * Clean dir after executing script
   */
  private clean = async () => {
    await shell.rm('-rf', this.folderPath);
  };

  /**
   * Execute the code
   */
  public executeOne = async (customInp?: string) => {
    // Forbiden
    if (this.isMany) return 403;

    if (customInp) await this.prepare(customInp);

    // Execute running command
    this.executeScript =
      'timeout ' +
      this.timeout +
      ' ' +
      process.cwd() +
      '/src/Template/executeOne.sh ' +
      this.language.execution +
      ' ' +
      this.appDir +
      ' ' +
      this.outDir +
      ' ' +
      this.inpDir +
      ' ' +
      this.folderPath;

    const exitCode = (await shell.exec(this.executeScript)).code;

    if (customInp) await this.clean();
  };

  public executeMany = async (workingFolder: string) => {

    await this.prepare();

    const testFolders = shell.ls(workingFolder).stdout.split('\n');
    this.isMany = false;
    for (let i = 1; i <= testFolders.length - 1; ++ i) {
      console.log('Running test ' + i);
      this.inpDir = workingFolder + i + '/' + i + '*.inp';
      await shell.rm('-f', workingFolder + i + '/' + '*.out');
      this.outDir = workingFolder + i + '/' + i + '.out';
      await this.executeOne();

    }

    this.isMany = true;
    await this.clean();
  }
}
