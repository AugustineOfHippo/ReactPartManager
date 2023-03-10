const express = require('express')
const router = express.Router();
const makeController = require('../controllers/modelmake')

router.route('/')
.get(makeController.getMakes);

module.exports = router;
