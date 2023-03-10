const Part = require('../models/part')
const Category = require('../models/categories');
const Truck = require('../models/truck');


module.exports.getOnePart = async(req,res) => {
    const { partId } = req.params;
    try {
        const foundPart = await Part.findById(partId);
        if(foundPart){
            res.send(foundPart)
        } else {
            res.send('No part found')
        }
    } catch (error) {
        res.send(error)
    }
}

module.exports.getParts = async(req,res) => {
    const parts = await Part.find({});
    res.send(parts)
    // .catch(err => res.status(400).json('Error: ' + err));
}
module.exports.getPartsById = async(req,res) => {
    const { truckId } = req.params;
    const parts = await Part.find({truck:truckId})
    res.send(parts)
}
module.exports.editPartById = async(req,res) => {
    const { partId } = req.params;
    const { image,name,quantity,category,description,location} = req.body;

    const lowerName = name.toLowerCase();
    const lowerImage = image.toLowerCase();
    const lowerCat = category.toLowerCase();
    const lowerDescription = description.toLowerCase();
    const lowerLocation = location.toLowerCase();

    // FIND THE PART BEFORE THE EDIT
    const myPart = await Part.findById(partId);
    //FIND PART AND UPDATE
    const part = await Part.findByIdAndUpdate(partId,{
        image:lowerImage,
        description:lowerDescription,
        category:lowerCat,
        name:lowerName,
        quantity:quantity,
        location:lowerLocation
    },{new:true});
    await part.save()

    // Find the the truck to push new cat inside
    const truck = await Truck.findById(myPart.truck).populate(
        {
            path:'partcategories',
            populate :{
                path:'parts'
            }
        }
    );

    
    // if the category has been changed
    if(myPart.category !== part.category){
        // I need to find the category that the part was in and remove it
        await Category.findOneAndUpdate( {parts: { $in : partId } }, {$pull : { parts: {$in : partId}}} );
        // IF THE CATEGORY OF THE PART HAS ONLY 1 PART AND ITS CHANGING CATEGORY, WE REMOVE THAT CATEGORY FROM THE TRUCK
        const truck3 = truck.partcategories.filter(x => x.name === myPart.category);
        // ONLY 1 PART INSIDE THAT CATEGORY, WE REMOVE WHOLE CAT
        if(truck3[0].parts.length === 1){
            await Truck.findByIdAndUpdate(myPart.truck,{ $pull : { partcategories: {name:myPart.category}}})
        } else {
            // MORE THEN 1 PART INSIDE THE CATEGORY,PULL ONLY THE PART
            await Truck.findByIdAndUpdate(myPart.truck,{ $pull : { partcategories : { parts : {$in : partId} } } } )
        }
    }

    const truck2 = await truck.partcategories.filter(x => x.name === part.category)
    // Look if the new category already exist
    const existingCat = await Category.findOne( {name:part.category } )
    // If it exist, push the part inside
    if(existingCat){
        existingCat.parts.push(part);
        // const truck2 = truck.partcategories.filter(x => x.name === part.category);
        if(truck2.length > 0){
            truck2[0].parts.push(part);
        } else {
            const newCat = {
                name:part.category,
                parts:[]
            };
            newCat.parts.push(part);
            truck.partcategories.push(newCat);
        }
        await existingCat.save()
        await truck.save()
    } else {
        // We need to create a new category
        const newCat = new Category({
            name:part.category,
            parts:[]
        })
        newCat.parts.push(part)
        truck.partcategories.push(newCat);
        await truck.save()
        await newCat.save()
    }
    res.send({truckcategories:truck.partcategories});
    
}
module.exports.deletePartById = async(req,res) => {
    const { partId} = req.params;
    const part = await Part.findById(partId);
    try {
        // Find the category and remove the part from it
        const cat = await Category.findOneAndUpdate({parts : {$in : partId}},{$pull : {parts :{$in:partId} }  },{new:true});
        // Find the truck and remove the part from its array
        const truck = await Truck.findOneAndUpdate({_id:part.truck},{$pull: {partcategories: {parts: {$in:partId} } } } );
        await truck.save()
        // Save the cat
        await cat.save()
        // Find the part and delete
        await Part.findByIdAndDelete(partId)
        // If it was the last part inside that category we delete the category
        if(cat.parts.length === 0){
            // Find the category and delete
        await Category.findByIdAndDelete(cat._id);  
                res.send('ok')
        } else {
            res.send('error')
        }
        
    } catch (error) {
        console.log(error)
    }

}

module.exports.addQuantityById = async(req,res) => {
    const { partId } = req.params;
    const part = await Part.findById(partId)
        part.quantity += 1;
    await part.save();
    res.send(part)  
}
module.exports.removeQuantityById = async(req,res) => {
    const { partId } = req.params;
    const part = await Part.findById(partId)
    part.quantity -= 1;
    await part.save()
    res.send(part)
}
module.exports.getPartsByCategory = async(req,res) => {
    const { category } = req.params;
    const parts = await Part.find({category:category.toLowerCase()});
    if(parts){
        res.send(parts);
    } else {
        console.log('Error')
    }
}
module.exports.getPartsByCategoryAndTruckId = async(req,res) => {
    const { truckId,category} = req.params; 
    const parts = await Part.find({truck:truckId,category:category}) 
    res.send(parts)
}