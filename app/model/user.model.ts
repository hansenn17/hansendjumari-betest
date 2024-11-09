import mongoose, { Schema, Document } from "mongoose";

import { User } from "../type/user";

export interface UserDocument extends User, Document {}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
    },
    identityNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<UserDocument>("User", UserSchema);
