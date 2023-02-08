const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const multer = require("multer");
const XLSX = require("xlsx");
const xlsxFile = require('read-excel-file/node');
const nodemailer = require("nodemailer");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateUploadInput = require("../../validation/upload");
const User = require("../../models/User");

async function mailerfun(emailadd, pass) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'princygajera121@gmail.com',
      pass: keys.gmail_pass
    }
  });

  let info = await transporter.sendMail({
    from: '"Princy" <princygajera121@gmail.com>',
    to: emailadd,
    subject: "Hello ✔",
    text: `Hello ${emailadd} your auto generated password is ${pass}`,
  });
  console.log("Message sent: %s", info.messageId);
}


function generatePassword() {
  var length = 8,
    charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
    password = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

//handle excel
const uploadXLSX = async (req, res, next) => {
  try {
    var path = req.file.path;
    var filename = req.file.filename;
    var workbook = XLSX.readFile(path);
    var sheet_name_list = workbook.SheetNames;
    var jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "xml sheet has no data",
      });
    }

    var totalError = [];
    var Dataset = [];
    for (let person of jsonData) {
      const { errors, isValid } = validateUploadInput(person);
      if (!isValid) {
        person.ErrorLog = JSON.stringify(errors);
        var newwb = XLSX.utils.book_new();
        var newws = XLSX.utils.json_to_sheet(jsonData);
        XLSX.utils.book_append_sheet(newwb, newws, "new data");
        XLSX.writeFile(newwb, "./uploads/error " + filename);
        totalError.push(errors);
      }
      else {
        let user = await User.findOne({ email: person.email }).exec();
        if (user) {
          person.ErrorLog = `${person.email} already exists`;
          var newwb = XLSX.utils.book_new();
          var newws = XLSX.utils.json_to_sheet(jsonData);
          XLSX.utils.book_append_sheet(newwb, newws, "new data");
          XLSX.writeFile(newwb, "./uploads/error " + filename);
          totalError.push(`${person.email} already exist`);
        }
        else {
          let pass = generatePassword();
          const newUser = new User({
            name: person.name,
            email: person.email,
            role: "user",
            password: pass
          });
          bcrypt.genSalt(10, (err, salt) => {
            +-bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err)
                throw err;
              newUser.password = hash;
            });
          });
          Dataset.push(newUser);
          mailerfun(person.email, pass).catch(console.error);
        }
      }
    };
    let response;
    console.log(Dataset);
    response = await User.insertMany(Dataset, { ordered: true });

    console.log("Error", totalError);
    res.json(jsonData);
  }
  catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post("/upload", upload.single("xlsx"), uploadXLSX);


router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password
      });
      mailerfun(req.body.email, "");

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        +-
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
      });
    }
  });
});


router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {

    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 100000
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      }
      else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;