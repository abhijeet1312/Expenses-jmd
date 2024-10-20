import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,

    },
    useremail: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid mobile number!`
        },
    },



});


export default mongoose.model('User', UserSchema)