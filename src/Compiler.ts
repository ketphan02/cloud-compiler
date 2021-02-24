import { Language } from './lang';
import * as shell from 'shelljs';

export class Compiler {
  private code: string;
  private language: Language;
  private folderPath: string;
  private appPath: string;
  private executeScript: string;

  constructor(language: Language, code: string) {
    this.language = language;
    this.code = code;
    this.folderPath = '/tmp/compile/' + this.language.folder + '/';
    this.appPath = this.folderPath + 'app.' + this.language.extension;

    this.executeScript = this.language.execution + ' ' + this.appPath;
    this.executeScript = process.cwd() + '/src/Template/executeOne.sh python3 ' + this.appPath + ' '  + process.cwd() + '/tmp/outputsFolder/app.out' + ' ' + process.cwd() + '/tmp/inputsFolder/app.inp' + ' ' + this.folderPath;
  }

  /**
   * Copy code to particular folder
   */
  private prepare = async () => {
    await console.log('Preparing the environment');
    await shell.mkdir('-p', this.folderPath);
    await shell.echo('-e' , this.code).to(this.appPath);
  };

  /**
   * Clean dir after executing script
   */
  private clean = async () => {
    console.log('Succeeded')

    await shell.rm('-rf', this.folderPath);
  }

  /**
   * Execute the code
   */
  public excute = async () => {
    await this.prepare();
    await console.log('Executing the script')
    await shell.exec(this.executeScript);
    await this.clean();
  }

}