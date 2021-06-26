const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  //get token from header
  const token = req.header('x-auth-token');

  //check if there is no token
  if (!token) {
    return res.status(401).json({ msg: 'You are not authorized' });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'You are not authorized.' });
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ msg: 'You are not authorized' });
  }
};
