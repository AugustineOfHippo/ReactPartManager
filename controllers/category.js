
const Category = require('../models/categories')
const Truck = require('../models/truck')

module.exports.getCategories = async(req,res) => {
    const cats = await Category.find({});
    res.send(cats);
}

module.exports.getCategoriesByTruckId = async(req,res) => {
    const { truckId } = req.params;
    // const cats = await Category.find({truck:truckId});
    try {
        const truck = await Truck.findById(truckId).populate('partcategories');
        res.send(truck.partcategories);
    } catch (error) {
        console.log(error)
    }

    // .catch(err => res.status(400).json('Error: ' + err));

}

// We are not using this yet...
module.exports.getCategoriesByMake = async(req,res) => {
    const { truckMake } = req.params;
    const cats = await Category.find({}).populate('truck');
    const categories = cats.map(cat => {
        return cat;
    })
    res.send(categories);
}