const express = require('express')
const router = express.Router();
const categoryController = require('../controllers/category')

router.route('/')
.get(categoryController.getCategories);

router.route('/makes/:make')
.get(categoryController.getCategoriesByMake)

router.route('/:truckId')
.get(categoryController.getCategoriesByTruckId)





module.exports = router;
