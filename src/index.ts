import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { runCompiler } from './app';
import { validLang } from './lang';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get('/', async (req, res) => {

    const lang = req.query.language;
    const { code, timeout, isMany } = req.query;

    let language: validLang | undefined;

    switch (lang) {
        case 'python': language = 'python'; break;
        case 'javascript': language = 'javascript'; break;
        case 'cpp': language = 'cpp'; break;
        default: language = undefined;
    }

    if (language && typeof code === 'string' && (typeof timeout === 'string' || typeof timeout === 'number') && isMany === 'true' && typeof req.query.inputsDir === 'string') {
        const result = await runCompiler(language, code, typeof timeout === 'string' ? parseInt(timeout) : timeout, true, undefined, req.query.inputsDir);
        res.send(result).status(200);
    }
    else if (language && typeof code === 'string' && (typeof timeout === 'string' || typeof timeout === 'number')  && typeof req.query.input === 'string') {
        const result = await runCompiler(language, code, typeof timeout === 'string' ? parseInt(timeout) : timeout, false, req.query.input, undefined);
        res.send(result).status(200);
    }
    else res.sendStatus(404);
});