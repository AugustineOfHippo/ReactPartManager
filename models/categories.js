const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name:String,
    parts:[{
        type:Schema.Types.ObjectId,
        ref:'Part'
    }]
})

module.exports = mongoose.model('Category',categorySchema);
