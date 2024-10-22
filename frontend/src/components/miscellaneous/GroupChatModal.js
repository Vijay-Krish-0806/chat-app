import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useToast,
  FormControl,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [groupChatname, setGroupChatName] = useState()
  const [selectedUsers, setSelectedUsers] = useState([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { user, chatsState, setChatsState } = ChatState()
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id))
  }
  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: 'User already exists',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    setSelectedUsers([...selectedUsers, userToAdd])
  }
  const handleSearch = async (query) => {
    setSearch(query)
    if (!query) {
      setSearchResults([])
      return
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const { data } = await axios.get(`/api/user?search=${search}`, config)
      setLoading(false)
      setSearchResults(data)
      console.log(data)
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
  const handleSubmit = async () => {
    if (!groupChatname || !selectedUsers) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatname,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      )
      setChatsState([data, ...chatsState])
      onClose()
      toast({
        title: 'New Chat is Created',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
      })
      return
    } catch (error) {
      toast({
        title: 'Error occured in group chat',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
        description: error.message,
      })
      return
    }
  }
  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize='35px'
            fontFamily='Work sans'
            display='flex'
            justifyContent='center'
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display='flex' flexDir='column' alignItems='center'>
            <FormControl>
              <Input
                placeholder='Chat Name'
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder='Add Users'
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
              {loading ? (
                <Spinner />
              ) : (
                searchResults
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleGroup(user)}
                    />
                  ))
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModal
