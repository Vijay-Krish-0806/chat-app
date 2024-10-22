import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ChatContext = createContext()

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState()
  const [selectedChat, setSelectedChat] = useState('')
  const [chatsState, setChatsState] = useState([])
  const [notification, setNotification] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    setUser(userInfo)

    console.log('userInfo', userInfo)
    if (!userInfo) {
      navigate('/')
    }
  }, [navigate])

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chatsState,
        setChatsState,
        selectedChat,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
export const ChatState = () => {
  return useContext(ChatContext)
}

export default ChatProvider
