const mongoose = require('mongoose');
mongoose.set('strictQuery',false);


const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected : ${conn.connection.host}`);
    }catch(error){
        console.log(error);
    }
}


module.exports = connectDB;