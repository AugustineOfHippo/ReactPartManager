const express = require('express')
const router = express.Router();
const partController = require('../controllers/part')

router.route('/')
.get(partController.getParts);

router.route('/part/onePart/:partId')
.get(partController.getOnePart)

router.route('/part/:truckId')
.get(partController.getPartsById);

router.route('/:category')
.get(partController.getPartsByCategory)

router.route('/:category/:truckId')
.get(partController.getPartsByCategoryAndTruckId)

router.route('/edit/:partId')
.put(partController.editPartById);

router.route('/edit/:partId/addQuantity')
.put(partController.addQuantityById);

router.route('/edit/:partId/removeQuantity')
.put(partController.removeQuantityById);

router.route('/delete/:partId')
.delete(partController.deletePartById)



module.exports = router;