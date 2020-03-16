const express = require("express");
const morgan = require('morgan');
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");


require('dotenv').config();

const app = express();

// import routes

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

// app middleware
app.use(morgan('dev'))
app.use(bodyParser.json())
// app.use(cors()) // allow all origins

if (process.env.NODE_ENV = 'development'){
    app.use(cors({ origin: process.env.CLIENT_URL }))
}

//routes middleware
app.use('/api', authRoutes)
app.use('/api', userRoutes)


const port = process.env.PORT || 8000

// connect to db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server started on port ${process.env.PORT} ...`);
        console.log(`mode ${process.env.NODE_ENV}`);
    })
})
.catch((err)=>console.log('Database Connection error: ', err))
