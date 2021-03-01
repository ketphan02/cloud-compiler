import * as express from 'express';
import API from './api'

const router = express.Router();

router.use('/api', API)

export default router;