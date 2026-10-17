import mongoose from "mongoose";

const connectDB = async () => {
    try {
         mongoose.connection.on("connected", () => {
            console.log("Mongoose connected to Sara7a_App Database");
        });
        await mongoose.connect(process.env.DB_URI, { serverSelectionTimeoutMS: 5000 });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;