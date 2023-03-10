const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Category = require('../models/categories')
// mongoose.set('debug',true);


const partSchema = new Schema({
    image:String,
    name:String,
    description:String,
    quantity:Number,
    category:String,
    location:String,
    truck:{
        type:Schema.Types.ObjectId,
        ref:'Truck'
    }
});

module.exports = mongoose.model('Part',partSchema);
