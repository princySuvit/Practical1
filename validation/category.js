const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateCategoryInput(data) {
  let errors = {};

  data.categoryName = !isEmpty(data.categoryName) ? data.categoryName : "";
  
  if (Validator.isEmpty(data.categoryName)) {
    errors.categoryName = "Category Name is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};