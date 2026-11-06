import mongoose from "mongoose";


const TokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    expiresIn: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
   
  },
);
 
TokenSchema.index ("expiresIn", { expireAfterSeconds: 0 });
 
const TokenModel = mongoose.model("Token", TokenSchema);

export default TokenModel;
