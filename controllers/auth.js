const User = require('../models/user')
const { registerValidation,loginValidation } = require('../validation')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports.logUser = async(req,res) => {

    // VALIDATE THE DATA
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message)

     // CHECK IF EMAIL EXIST
     const user = await User.findOne({email:req.body.email})
     if(!user) return res.status(400).send('Email not valid')

     // CHECK IF PASSWORD IS CORRECT
     const validPass = await bcrypt.compare(req.body.password,user.password);
     if(!validPass) return res.status(400).send('Invalid Password')

     // CREATE AND ASSIGN JWT 
     const token = jwt.sign({_id: user._id},process.env.TOKEN_SECRET);


}

module.exports.registerUser = async(req,res) => {

    // VALIDATE THE DATA
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message)

    // CHECK IF USER ALREADY EXIST
    const emailExist = await User.findOne({email:req.body.email})
    if(emailExist) return res.status(400).send('Email already exist')

    // HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);

   // CREATE A NEW USER
    const user = new User({
        name: req.body.name,
        email:req.body.email,
        password:hashPassword
    })
    try {
         await user.save();
        res.send({user: user._id})
    } catch (error) {
        res.status(400).send(error);
    }
}