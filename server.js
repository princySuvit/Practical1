const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const categories = require("./routes/api/categories");
const products = require("./routes/api/products");
const getProducts = require("./routes/api/getProducts");


const app = express();
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/getProducts", getProducts);
app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));


