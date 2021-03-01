const express = require('express');
import runOnly from '../../controllers/runOnly';
import gradeAll from '../../controllers/gradeAll';

const router = express.Router();

router.get('/runOnly', runOnly);
router.get('/gradeAll', gradeAll);

export default router;
