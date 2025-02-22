import mongoose from "mongoose";
import mongo_URL from "./config.js";

const connectDB = async () => {
    try {
        await mongoose.connect(mongo_URL);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
};

export default connectDB;



const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const CategoryLimitSchema = new mongoose.Schema({
  userId: { type: String, required: true },  
  category: { type: String, required: true },
  limit: { type: Number, required: true },
});
const UserSchema = new mongoose.Schema({
    userId:{ type:String, unique:true, required:true},
    password:{ 
        type:String,
        required:true,
    },
    points:{type: Number, default:400}
})

export const TransactionModel = mongoose.model("Transaction", TransactionSchema);
export const CategoryLimitModel = mongoose.model("CategoryLimit", CategoryLimitSchema);
export const UserModel = mongoose.model("Users", UserSchema);
