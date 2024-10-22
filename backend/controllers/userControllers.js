const expressAsyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const { generateToken } = require('../config/generateToken')

exports.registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body
  if (!name || !email || !password) {
    res.status(400).json({
      error: 'Please enter all the fields',
    })
  }
  await User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({
        message: 'User already exists!!',
      })
    } else {
      const user = new User({ name, email, password, pic })
      user
        .save()
        .then((newUser) => {
          return res.status(200).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            pic: newUser.pic,
            token: generateToken(newUser._id),
          })
        })
        .catch((err) => {
          return res.status(401).json({
            error: `unable to save to db ${err.message}`,
          })
        })
    }
  })
})

exports.authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body
  User.findOne({ email }).then(async (user) => {
    if (user && (await user.matchPassword(password))) {
      console.log('authUser success')
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      })
    } else {
      console.log('authUser fails')
      res.status(400).json({
        message: 'Invalid credentials',
      })
    }
  })
})

exports.allUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {}
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
  return res.send(users)
})
