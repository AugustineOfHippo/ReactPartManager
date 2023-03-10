
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const truckMakeSchema = new Schema({  
        make:String,
        total:Number,
        models:[
            {
                name:String,
                quantity:Number
            }
        ]
});

module.exports = mongoose.model('TruckMake',truckMakeSchema);
