const Part = require('../models/part')
const Make = require('../models/truckMake')
const Truck = require('../models/truck')
const Category = require('../models/categories')
const part = require('../models/part')


module.exports.getTrucks = async(req,res) => {
    const trucks = await Truck.find({}).populate(
        {
            path:'partcategories',
            populate: {
                path:'parts'
            }
        }
        )
    res.send(trucks)
}
module.exports.getTruckById = async(req,res) => {
    const { truckId } = req.params;
    const truck = await Truck.findById(truckId).populate(
        {
            path:'partcategories',
            populate :{
                path:'parts'
            }
        }
    )
    res.send(truck);
}
module.exports.getTruckPartById = async(req,res) => {
    const { truckId } = req.params;
    const truck = await Truck.findById(truckId).populate(
        {
            path:'partcategories',
            populate :{
                path:'parts'
            }
        }
    )
    res.send(truck.partcategories);
}
module.exports.getTruckPartByCategory = async(req,res) => {
    const { truckId, category } = req.params;
    const truck = await Truck.findById(truckId).populate(
        {
            path:'partcategories',
            populate :{
                path:'parts'
            }
        }
    )
    const parts = [];
    await truck.partcategories.map(cat => {
        if(cat.name === category){
            cat.parts.map(part => {
                if(part.truck === truckId){
                    parts.push(part);
                }
            })
        }
    })

    res.send(parts);
}
module.exports.addTruck = async(req,res) => {
    const newTruck = new Truck(req.body.truck);
    const { make,model } = req.body.truck;
    // const upperMake = make.charAt(0).toUpperCase() + make.slice(1);
    const lowerMake = make.toLowerCase();
    const lowerModel = model.toLowerCase();
    // check if we already have a make with this model
    const foundMake = await Make.findOne({ make:lowerMake, models:{$elemMatch:{name:lowerModel}} })

    // Check if we already have this make with this model
    if(foundMake){
        // if we do, increase the count of the model
        foundMake.models.filter(item => item.name === lowerModel)[0].quantity += 1;
        foundMake.total += 1;
        await foundMake.save();
    } else { 
        // check if we have this make
        const existMake = await Make.findOne({make:lowerMake});
        if(existMake){
            // if make exist, we push the new model inside with quantity 1
            existMake.models.push({name:lowerModel,quantity:1})
            existMake.total += 1;
            await existMake.save();
        } else {
            // if we dont have, we make a new make
            const newMake = new Make({
                make:lowerMake,
                total:1,
                models:[{
                    name:lowerModel,
                    quantity:1
                }]
            });
            await newMake.save();
        }
    }
    newTruck.model = lowerModel;
    newTruck.make = lowerMake;
    await newTruck.save()
    .then( () => res.send(newTruck))
    .catch( err => res.status(400).json('Error ' + err))
}
module.exports.addPartToTruck = async(req,res) => {
    const { truckId } = req.params;
    const { image,name,quantity,category,description,location} = req.body;
    
    const lowerName = name.toLowerCase();
    const lowerImage = image.toLowerCase();
    const lowerCat = category.toLowerCase();
    const lowerDescription = description.toLowerCase();
    const lowerLocation = location.toLowerCase();
    // Find the cat
    const cat = await Category.findOne({name:lowerCat});
    // Find the truck

    if(truckId !== ''){

        const truck = await Truck.findOne({_id:truckId}).populate(
            {
                path:'partcategories',
                populate :{
                    path:'parts'
                }
            }
        )
        // Create New Part
        const newPart = new Part({
            name:lowerName,
            image:lowerImage,
            quantity:quantity,
            category:lowerCat,
            description:lowerDescription,
            location:lowerLocation
        });
        newPart.truck = truck._id;
    
        await newPart.save();
        // If we have this cat, push the part inside
        if(cat){
            cat.parts.push(newPart);
            await cat.save();
            // If we dont have , create new category and push part inside
        } else {
            const newCat = new Category({
                name:lowerCat
            });
            newCat.parts.push(newPart);
            await newCat.save();
        }


        // Look for the cat inside the truck object
        const handleParts = async() => {
            const cat2 = truck.partcategories.filter(x => x.name === newPart.category);
            if(cat2.length > 0){
                    cat2[0].parts.push(newPart);
            } else {
                const newCategory = {
                    name:lowerCat,
                    parts:[]
                };
                newCategory.parts.push(newPart);
                truck.partcategories.push(newCategory);
            }
        }

        await handleParts();
        await truck.save();
        res.send(newPart)
    } else {
        console.log('Truck Id Not Found')
    }

}
module.exports.deleteTruckById = async(req,res) => {
    const { truckId } = req.params;
    const truck = await Truck.findById(truckId);

    const deleteMake = async(id) => {
        await Make.findByIdAndDelete(id);
    }

    const saveMake = async(obj) => {
        obj.total -= 1;
        await obj.save();
    }

    // We search to see if we have another model in this category
    try {
        const foundMake = await Make.findOne({ make:truck.make, models:{ $elemMatch:{ name:truck.model } } } );
            // if this make already exist
            if(foundMake){
                // if there is only 1
                if(foundMake.models.length === 1){
                    // map through the array
                    foundMake.models.map(model => {
                        // if only 1, delete the make
                        if(model.quantity === 1){
                            deleteMake(foundMake._id);
                            // else remove 1 quantity from it
                        } else {
                            if(model.name === truck.model){
                                model.quantity -= 1;
                                saveMake(foundMake);
                            }
                        }
                    })
                    // If there is more then 1 model
                } else {
                    // map through and find the one with same name and remove 1 quantity
                    foundMake.models.map(model => {
                        if(model.name === truck.model){
                            model.quantity -= 1;
                            saveMake(foundMake);
                        }
                    })
                }
            }
            await Truck.findByIdAndDelete(truckId);
    } catch (error) {
        console.log(error)
    }
   
}
module.exports.editTruckById = async(req,res) => {

    const {truckId} =  req.params;
    try {
       const editedTruck =  await Truck.findByIdAndUpdate(truckId,req.body,{new:true});
       await editedTruck.save();
        res.send(editedTruck);
    } catch (error) {
        res.send('Got an error: '+error)
    }
    
}