const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Category = mongoose.model("categories", CategorySchema);