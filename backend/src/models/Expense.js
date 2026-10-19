import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: [0, 'Split amount cannot be negative'],
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
    },
    amountPaise: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than zero'],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    splits: {
      type: [splitSchema],
      validate: {
        validator: function (splits) {
          return splits.length > 0;
        },
        message: 'At least one split is required',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isSettlement: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['general', 'food', 'travel', 'groceries', 'utilities', 'rent', 'entertainment'],
      default: 'general',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    nextRecurringDate: {
      type: Date,
    },
    originalCurrency: {
      type: String,
      default: 'INR',
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
