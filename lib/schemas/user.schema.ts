import { Schema, models, model } from "mongoose"

const UserSchema = new Schema(
    {
        clerk_id: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true}
    },
   {
        timestamps: true,
        collection: "users"
   }
);

const User = models.User || model("User", UserSchema);
export default User;