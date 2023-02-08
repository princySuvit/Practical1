const express = require("express");
const router = express.Router();
const generateUniqueId = require("generate-unique-id");
const Category = require("../../models/Category");
const validateCategoryInput = require("../../validation/category");

router.post("/category", async (req, res) => {
  const { errors, isValid } = validateCategoryInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const id = generateUniqueId();
  let parentId = req.body.parentId;
  if (parentId === undefined) {
    parentId = "null";
  }

  let request = { ...req.body, id: id, parentId: parentId, userName: undefined };
  const newCat = new Category(request);
  try {
    const response = await newCat.save();
    res.send(response);
  } catch (err) {
    res.send(err)
  }

});

module.exports = router;