const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    catagoryId: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    images: {
        type: [{ type: String }]
    }
});

module.exports = Product = mongoose.model("products", ProductSchema);