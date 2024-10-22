import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import animationData from '../config/typing.json'
import Lottie from 'react-lottie'
import { getSender, getSenderFull, isSameSender } from '../config/ChatLogics'
import ProfileModel from './miscellaneous/ProfileModel'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import axios from 'axios'
import ScrollableChat from './ScrollableChat'
import io from 'socket.io-client'

const ENDPOINT = 'http://localhost:5000'
var socket, selectedChatCompare
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const toast = useToast()
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit('setup', user)
    socket.on('connected', () => {
      setSocketConnected(true)
    })
    socket.on('typing', () => setIsTyping(true))
    socket.on('stop typing', () => setIsTyping(false))
  })
  const sendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id)
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        }
        const { data } = await axios.post(
          `/api/message`,
          { content: newMessage, chatId: selectedChat._id },
          config
        )
        socket.emit('new message', data)
        setMessages([...messages, data])
        setNewMessage('')
      } catch (error) {
        toast({
          title: 'Error occurred',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'bottom-left',
          description: 'Failed to send Message',
        })
      }
    }
  }

  const fetchMessages = async () => {
    if (!selectedChat) {
      return
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      setLoading(true)
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      )
      setMessages(data)
      setLoading(false)
      socket.emit('join chat', selectedChat._id)
    } catch (error) {
      toast({
        title: 'Error occurred',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom-left',
        description: 'Failed to load chats',
      })
    }
  }

  const typingHandler = (e) => {
    setNewMessage(e.target.value)
    if (!socketConnected) return
    if (!typing) {
      setTyping(true)
      socket.emit('typing', selectedChat._id)
    }
    let lastTypingTime = new Date().getTime()
    var timerLength = 3000
    setTimeout(() => {
      var timeNow = new Date().getTime()
      var timeDiff = timeNow - lastTypingTime
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id)
        setTyping(false)
      }
    }, timerLength)
  }

  useEffect(() => {
    fetchMessages()
    selectedChatCompare = selectedChat
  }, [selectedChat])

  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification])
          setFetchAgain(!fetchAgain)
        }
      } else {
        setMessages([...messages, newMessageReceived])
      }
    })
  })
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={3}
            w='100%'
            fontFamily='Work sans'
            display='flex'
            justifyContent={{ base: 'space-between' }}
            alignItems='center'
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            ></IconButton>
            {selectedChat.chatName}
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <UpdateGroupChatModal
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchMessages={fetchMessages}
              />
            )}
          </Text>
          <Box
            display='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='#E8E8E8'
            w='100%'
            borderRadius='lg'
            overflowY='hidden'
            h='100%'
          >
            {loading ? (
              <Spinner
                size='xl'
                w={20}
                h={20}
                alignSelf='center'
                margin='auto'
              />
            ) : (
              <ScrollableChat messages={messages} />
            )}
          </Box>
          <FormControl onKeyDown={sendMessage} isRequired mt={3}>
            {isTyping ? (
              <div>
                <Lottie
                  width={70}
                  options={defaultOptions}
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              </div>
            ) : (
              <></>
            )}
            <Input
              variant='filled'
              bg='#E0E0E0'
              placeholder='Enter a message...'
              onChange={(e) => typingHandler(e)}
              value={newMessage}
            />
          </FormControl>
        </>
      ) : (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          h='100%'
        >
          <Text fontSize='3xl' pb={3} fontFamily='Work sans'>
            Click on user to start chatting
          </Text>
        </Box>
      )}
    </>
  )
}

export default SingleChat
