import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/Enums/user.enum.js";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      minlength: [3, "First Name must be at least 3 characters long"],
      maxlength: [50, "First Name must be at most 50 characters long"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      minlength: [3, "Last Name must be at least 3 characters long"],
      maxlength: [50, "Last Name must be at most 50 characters long"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },
      select: false,
    },
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },

      validate: {
        validator: function (value) {
          const thirteenYearsInMs = 13 * 365.25 * 24 * 60 * 60 * 1000;
          const userAgeInMs = Date.now() - value.getTime();
          return userAgeInMs >= thirteenYearsInMs;
        },
        message: "You must be at least 13 years old",
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },

    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
      required: [true, "Gender is required"],
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmail: Date,
    forgetPasswordOtp: String,
    profileImage: String,
    changeCridentialsTime: Date,
    coverImage: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  },
);

UserSchema.virtual("age").get(function () {
  return Math.floor(
    (Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
});

UserSchema.virtual("userName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
