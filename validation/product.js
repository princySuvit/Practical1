const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateProductInput(data) {
  let errors = {};

  data.productName = !isEmpty(data.productName) ? data.productName : "";
  data.catagoryId = !isEmpty(data.catagoryId) ? data.catagoryId : "";
  data.parentId = !isEmpty(data.parentId) ? data.parentId : "";
  
  if (Validator.isEmpty(data.catagoryId)) {
    errors.catagoryId = "Catagory Id is required";
  } 
  if (Validator.isEmpty(data.productName)) {
    errors.productName = "Product Name is required";
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  };
};