const express = require("express");
const router = express.Router();
const generateUniqueId = require('generate-unique-id');
const Product = require("../../models/Product");
const validateProductInput = require("../../validation/product");
const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  }
});
const upload = multer({ storage: storage }).any('files');

router.post("/product", async (req, res) => {
  upload(req, res, async (err) => {
    const { errors, isValid } = validateProductInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const id = generateUniqueId();
    let parentId = req.body.parentId;
    if (parentId === undefined) {
      parentId = "null";
    }

    //images
    let files = [];
    req.files.forEach(element => {
      files.push('http://localhost:5000/uploads/' + element.filename);
    });

    let request = { ...req.body, id: id, parentId: parentId, images: files };
    const newProduct = new Product(request);
    try {
      const response = await newProduct.save();
      res.send(response);
    } catch (err) {
      res.send(err)
    }
    return;
  });
});

module.exports = router;