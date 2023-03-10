const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Part = require('./part')
const Category = require('./categories')
// mongoose.set('debug',true);

const truckSchema = new Schema({
    image:String,
    model:String,
    make:String,
    year:Number,
    vin:String,
    engine:String,
    transmission:String,
    reardiffmodel:String,
    reardiffratio:String,
    reardifflbs:Number,
    frontdiffmodel:String,
    frontdifflbs:Number,
    partcategories:[
        {
            name:String,
            parts:[{
                type:Schema.Types.ObjectId,
                ref:'Part'
            }]  
        }
    ]
    // parts:[{
    //     type:Schema.Types.ObjectId,
    //     ref:'Part'
    // }]
});

truckSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Part.remove({
            truck:doc._id
        })
        await Category.updateMany({}, {$pull: {parts: {$elemMatch : { truck: doc._id} } } } )
        // Must change this **
        // await Category.remove({
        //     truck:doc._id
        // })
    }
});

module.exports = mongoose.model('Truck',truckSchema);