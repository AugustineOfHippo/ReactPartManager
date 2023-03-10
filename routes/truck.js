const express = require('express')
const router = express.Router();
const truckController = require('../controllers/truck')

router.route('/')
.get(truckController.getTrucks)
.post(truckController.addTruck)

router.route('/:truckId')
.get(truckController.getTruckById)
.post(truckController.addPartToTruck)
.put(truckController.editTruckById)
.delete(truckController.deleteTruckById);

router.route('/:truckId/parts')
.get(truckController.getTruckPartById)

router.route('/:truckId/parts/:category')
.get(truckController.getTruckPartByCategory)

module.exports = router;
