const express = require('express');
const router = express.Router();
const axios = require('axios');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  '/',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password must be at least six character long').isLength({
      min: 6,
    }),
    body('recaptchaToken', 'reCaptchaToken is missing').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, recaptchaToken } = req.body;

    try {
      const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`;

      const response = await axios.post(googleVerifyUrl);

      if (response.data.success) {
        //checks if the user already exists
        const user = await User.findOne({ email });

        if (user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }

        //get user's gravatar
        const avatar = gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm',
        });

        const newUser = new User({ name, email, avatar, password });

        //encrypt password
        const salt = await bcrypt.genSalt(10);

        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        jwt.sign(
          { id: newUser.id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' },
          (error, token) => {
            if (error) {
              throw error;
            }

            // return jsonwebtoken
            res.json({ token });
          }
        );
      } else {
        return res.status(400).json({
          msg: 'Invalid Captcha. Try Again',
        });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
