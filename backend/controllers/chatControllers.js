const expressAsyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')

exports.accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body
  if (!userId) {
    console.log('userId param not sent with request')
    return res.sendStatus(400)
  }

  let isChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate('users', '-password')
    .populate('latestMessage.sender', 'name pic email')

  if (isChat) {
    return res.send(isChat)
  }

  const chatData = {
    chatName: 'sender',
    isGroupChat: false,
    users: [req.user._id, userId],
  }

  const createdChat = await Chat.create(chatData)
  const FullChat = await Chat.findById(createdChat._id).populate(
    'users',
    '-password'
  )

  if (createdChat) {
    return res.status(200).json({
      _id: createdChat._id,
      name: createdChat.name,
      email: createdChat.email,
      pic: createdChat.pic,
      token: generateToken(createdChat._id),
    })
  } else {
    return res.status(401).json({
      error: `Unable to save to database`,
    })
  }
})

exports.fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        // Populate latestMessage.sender field
        return await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name pic email',
        })
      })

    res.status(200).send(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

exports.createGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please fill all the fields' })
  }
  var users = JSON.parse(req.body.users)
  if (users.lemgth < 2) {
    return res.status(400).send('More than 2 users are required for group chat')
  }
  users.push(req.user)
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    })
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
    res.status(200).json(fullGroupChat)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

exports.renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
  if (!updatedChat) {
    res.status(400)
    throw new Error('Chat not found')
  } else {
    res.json(updatedChat)
  }
})

exports.addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body
  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
  if (!added) {
    res.status(400)
    throw new Error('Chat not found')
  } else {
    res.send(added)
  }
})

exports.removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
  if (!removed) {
    res.status(400)
    throw new Error('Chat not found')
  } else {
    res.json(removed)
  }
})
