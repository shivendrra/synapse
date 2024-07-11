const Joi = require('joi');

const signupValidation = (req, res, next) => {
  const Schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(4).max(20).required(),
  });
  const {error} = Schema.validate(req.body);
  if (error) {
    return res.status(400)
      .json({ message: "Bad request ", error })
  }
  next();
}

const loginValidation = (req, res, next) => {
  const Schema = Joi.object({
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(4).max(20).required(),
  });
  const {error} = Schema.validate(req.body);
  if (error) {
    return res.status(400)
      .json({ message: "Bad request ", error })
  }
  next();
}

module.exports = {
  signupValidation,
  loginValidation
}