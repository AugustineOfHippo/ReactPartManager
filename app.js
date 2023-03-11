const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require("passport")
const port = 4000;

dotenv.config();



const userRouter = require("./routes/userRoutes")

const truckRoutes = require('./routes/truck')
const partRoutes = require('./routes/part')
const categoryRoutes = require('./routes/category')
const makeRoutes = require('./routes/make')
// const authRoutes = require('./routes/auth')

// const uri = 'mongodb+srv://otb:otb@cluster0.mheoi.mongodb.net/PMV4?retryWrites=true&w=majority'

mongoose.connect('mongodb+srv://otb:otb@cluster0.mheoi.mongodb.net/PMV4?retryWrites=true&w=majority',
    {
       useNewUrlParser: true, 
       useUnifiedTopology: true
   
    });
   
    const db = mongoose.connection;
   db.on("error", console.error.bind(console,"connection error:"));
   db.once("open", () => {
       console.log("Database connected");
   });

  //  const whitelist = process.env.WHITELISTED_DOMAINS
  //       ? 'http://localhost:3000'.split(",")
  //       : []

  //       const corsOptions = {
  //           origin: function (origin, callback) {
  //             if (!origin || whitelist.indexOf(origin) !== -1) {
  //               callback(null, true)
  //             } else {
  //               callback(new Error("Not allowed by CORS"))
  //             }
  //           },
  //           credentials: true,
  //         }

  // require("./strategies/JwtStrategy")
  // require("./strategies/LocalStrategy")
  // require("./authenticate")

   app.use(cors());
   app.use(passport.initialize());
  
   app.use(express.urlencoded({extended: true}));
   app.use(bodyParser.json());
   app.use(cookieParser(process.env.COOKIE_SECRET))
   app.use(express.json());

   app.use('/trucks',truckRoutes)
   app.use('/parts',partRoutes)
   app.use('/category',categoryRoutes)
   app.use('/makes',makeRoutes);
   app.use("/users",userRouter);

   // HOME PAGE
app.get('/', (req,res) => {
  res.send('homepage');
});

   app.listen(port, () => {
    console.log("Server is running on port: "+port)
})