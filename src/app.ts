import { Compiler } from "./Compiler"
import { python } from "./lang"

const data = 'n = int(input())\nprint(n)'

const compiler = new Compiler(python, data);

compiler.excute();
