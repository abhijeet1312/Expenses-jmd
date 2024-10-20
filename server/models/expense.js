import mongoose from "mongoose";


const expenseSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User' },
    totalAmount: { type: Number, required: true },
    totalFriends: { type: Number, required: true },
    purpose: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    totalbillamount: { type: Number, required: true },
});

export default mongoose.model('Expense', expenseSchema);