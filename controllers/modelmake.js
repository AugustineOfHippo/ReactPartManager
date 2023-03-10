const Make = require('../models/truckMake')

module.exports.getMakes = async(req,res) => {
    const makes = await Make.find({})
    res.send(makes);
}