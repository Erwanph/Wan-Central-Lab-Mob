import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },
    score: { type: Number, default: 0 } // Ubah ini
});

export const UserModel = mongoose.model("User", UserSchema);
export const getUsers = () => UserModel.find();
export const getUserByEmail = (email:string) => UserModel.findOne({email});
export const getUserBySessionToken = (sessionToken : string) => UserModel.findOne({
    'authentication.sessionToken' : sessionToken,
})
export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id:String) => UserModel.findOneAndDelete({_id : id});
export const updateUserById = (id:string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values);
export const updateUserScore = (id: string, score: number) => 
    UserModel.findByIdAndUpdate(id, { score }, { new: true });