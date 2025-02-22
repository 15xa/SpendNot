import express from "express";
import cors from "cors";
import connectDB, { TransactionModel, CategoryLimitModel, UserModel } from "./db.js";

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.post("/check-transaction", async (req, res) => {
  try {
    const { userId, category, amount, redirectUrl } = req.body;

    if (!userId || !category || !amount || !redirectUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

   const userTransactions = await TransactionModel.find({
      userId,
      category,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    });

    const totalSpent = userTransactions.reduce((sum, txn) => sum + txn.amount, 0);

   const categoryLimit = await CategoryLimitModel.findOne({ userId, category });

    if (!categoryLimit) {
      return res.status(404).json({ message: "No limit set for this category" });
    }

    if (totalSpent + amount > categoryLimit.limit) {
     return res.status(411).json({ message: `Limit exceeded! You have ₹${categoryLimit.limit - totalSpent} left.` });
    }

   const newTransaction = new TransactionModel({
      userId,
      category,
      amount,
      date: new Date(),
    });
    await newTransaction.save();

   return res.status(200).json({ message: "Transaction successful", redirect: redirectUrl });

  } catch (err) {
    console.error("Error processing transaction:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/signup",async(req, res) => {
  try {
    const { userId, password } = req.body;

    const existingUser = await UserModel.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }


    const newUser = new UserModel({
      userId,
      password,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal server error" + err });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
