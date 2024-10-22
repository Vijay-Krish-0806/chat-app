import React, { useState } from 'react'
import {
  IconButton,
  useDisclosure,
  Button,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [groupChatName, setGroupChatName] = useState()
  const [search, setSearch] = useState()
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [renameLoading, setRenameLoading] = useState(false)
  const { selectedChat, setSelectedChat, user } = ChatState()
  const toast = useToast()
  const handleRemove = async (deluser) => {
    if (selectedChat.groupAdmin._id !== user._id && deluser._id !== user._id) {
      toast({
        title: 'Only admins can remove somenone',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
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
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: deluser._id,
        },
        config
      )
      deluser._id === user._id ? setSelectedChat('') : setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      fetchMessages()
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error occured',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
        description: error.response.data.message,
      })
      setLoading(false)
      return
    }
  }
  const handleRename = async () => {
    if (!groupChatName) return
    try {
      setRenameLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      )
      setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      setRenameLoading(false)
    } catch (error) {
      toast({
        title: 'Error occured',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
        description: error.response.data.message,
      })
      setRenameLoading(false)
      return
    }
  }
  const handleAddUser = async (addUser) => {
    if (selectedChat.users.find((u) => u._id === addUser._id)) {
      toast({
        title: 'User already exists in group',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
      })
      return
    }
    if (selectedChat.groupAdmin._id === addUser._id) {
      toast({
        title: 'Only admins can add somenone',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
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
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: addUser._id,
        },
        config
      )
      setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error occured',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom',
        description: error.response.data.message,
      })
      setLoading(false)
      return
    }
  }
  const handleSearch = async (query) => {
    setSearch(query)
    if (!query) {
      setSearchResult([])
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
      setSearchResult(data)
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
  return (
    <>
      <IconButton
        display={{ base: 'flex' }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal size='lg' isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize='40px'
            fontFamily='Work sans'
            display='flex'
            justifyContent='center'
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            flexDir='column'
          >
            <Box w='100%' display='flex' flexWrap='wrap' pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display='flex'>
              <Input
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                colorScheme='teal'
                ml={1}
                onClick={handleRename}
                isLoading={renameLoading}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder='Add User to group'
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner />
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModal
