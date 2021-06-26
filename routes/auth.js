const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { authenticate } = require('../middleware/auth');

// @route   GET api/users
// @desc    Auth route
// @access  Public
router.get('/', authenticate, (req, res) => {
  res.json(req.user);
});

// @route   POST api/auth
// @desc    Authenticate User and get Token
// @access  Public
router.post(
  '/',
  [
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //checks if the user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      jwt.sign(
        { id: user.id },
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
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
