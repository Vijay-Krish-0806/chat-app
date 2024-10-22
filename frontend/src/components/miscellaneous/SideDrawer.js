import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import ProfileModel from './ProfileModel'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ChatLoading from '../ChatLoading'
import UserListItem from '../UserAvatar/UserListItem'
import { getSender } from '../../config/ChatLogics'

const SideDrawer = () => {
  const {
    user,
    setSelectedChat,
    selectedChat,
    chatsState,
    setChatsState,
    notification,
    setNotification,
  } = ChatState()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [search, setSearch] = useState()
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [searchResult, setSearchResult] = useState([])
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please enter something in search',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-left',
      })
      return
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const { data } = await axios(`/api/user?search=${search}`, config)
      setLoading(false)
      setSearchResult(data)
      setSearch('')
    } catch (error) {
      toast({
        title: 'Error occured',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom-left',
        description: "failed to load Search results'",
      })
      return
    }
  }
  const logoutHandler = () => {
    localStorage.removeItem('userInfo')
    navigate('/')
  }
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true)
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      }
      const { data } = await axios.post(`/api/chat`, { userId }, config)
      if (!chatsState.find((c) => c._id === data._id)) {
        setChatsState([data, ...chatsState])
      }
      setLoadingChat(false)
      console.log(data)
      setSelectedChat(data)
      console.log(selectedChat)
      onClose()
    } catch (error) {
      toast({
        title: 'Error in fetching data',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom-left',
        description: error.message,
      })
      return
    }
  }

  return (
    <>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        bg='white'
        w='100%'
        p='5px 10px 5px 10px'
        borderWidth='5px'
      >
        <Tooltip label='Search Users to chat' hasArrow placement='bottom-end'>
          <Button variant='ghost' onClick={onOpen}>
            <i className='fa-solid fa-magnifying-glass'></i>
            <Text display={{ base: 'none', md: 'flex' }} px='4'>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize='2xl'>ChatApp</Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize='2xl' m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && 'no new messages'}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat)
                    setNotification(notification.filter((n) => n !== notif))
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `new Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size='sm'
                cursor='pointer'
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
                <MenuDivider />
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </ProfileModel>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display='flex' pb={2}>
              <Input
                placeholder='Search by name or email'
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  user={user}
                  key={user._id}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml='auto' display='flex' />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer
