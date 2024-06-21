const mongoose = require('mongoose');
require('dotenv').config()

function dataBaseConnection() {
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("dataBase connected");
    })
    .catch((err)=>{
        console.log({
            message:"some problem happened in the dataBase connection",err
        });
    })
}

module.exports = dataBaseConnection