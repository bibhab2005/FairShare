import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null for existing users temporarily
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dashes, and periods'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    upiId: {
      type: String,
      trim: true,
      match: [/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID (e.g., name@bank)'],
    },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
