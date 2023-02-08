const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");

router.post("/getProduct", async (req, res) => {
    var count = 10;
    var pageNo = req.body.pageNo;
    var totalcat = new Set();
    var List = req.body.category;
    var serach = await Category.find().exec();

    for (let x of List) {
        var current = [];
        current.push(x);
        while (current.length > 0) {
            var result = serach.filter((element) => {
                return element.parentId == current[0];
            });
            result.forEach(el => {
                current.push(el.id);
            })
            totalcat.add(current[0]);
            current.shift();
        }
    }

    var arr = Array.from(totalcat);
    const pipeline = [
        { $match: { catagoryId: { $in: arr } } },
        { $skip: count * pageNo },
        { $limit: count }
    ];
    const agg = await Product.aggregate(pipeline);
    res.send(agg);
});

module.exports = router;