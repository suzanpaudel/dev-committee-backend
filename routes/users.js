const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');

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
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    res.send('Post user route');
  }
);

module.exports = router;
