import mongoose from "mongoose";

// import mongoose from "mongoose";

const connectDB = async() => {

    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI, {


        });
        console.log(`DataBase connected: ${ conn.connection.host }`);

        console.log('Database connected successfully');
    } catch (error) {
        console.log(error)
    }
}
export default connectDB;