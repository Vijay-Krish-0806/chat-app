import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  FormControl,
  FormLabel,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from '@chakra-ui/react'

const Signup = () => {
  const [name, setName] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [confirmPassword, setconfirmPassword] = useState()
  const [pic, setPic] = useState()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const handleClick = () => {
    setShow(!show)
  }
  const navigate = useNavigate()
  const postDetails = async (pics) => {
    setLoading(true)
    if (pics === undefined) {
      toast({
        title: 'Please select image',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      return
    }
    if (
      pics.type === 'image/jpeg' ||
      pics.type === 'images/png' ||
      pics.type === 'image/jpg'
    ) {
      const data = new FormData()
      data.append('file', pics)
      data.append('upload_preset', 'chat_app')
      data.append('cloud_name', 'dkybtcweu')
      await fetch('https://api.cloudinary.com/v1_1/dkybtcweu/image/upload', {
        method: 'POST',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log(data)
          setPic(data.url.toString())
          setLoading(false)
        })
        .catch((err) => {
          console.log('error', err)
          setLoading(false)
        })
    } else {
      toast({
        title: 'Please select an image',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }
  const submitHandler = async () => {
    setLoading(true)
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      }
      const { data } = await axios.post(
        '/api/user',
        { name, email, password, pic },
        config
      )
      toast({
        title: 'Registartion successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      localStorage.setItem('userInfo', JSON.stringify(data))
      setLoading(false)
      navigate('/chats')
    } catch (error) {
      toast({
        title: 'Error occcured',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      setLoading(false)
    }
  }

  return (
    <VStack>
      <FormControl id='first-name' isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder='Enter your Name'
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </FormControl>
      <FormControl id='email1' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          placeholder='Enter your email'
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id='password1' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)}
            type={show ? 'text' : 'password'}
          />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={handleClick}>
              {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id='confirm-password' isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            value={confirmPassword}
            placeholder='Enter Confirm Password'
            onChange={(e) => setconfirmPassword(e.target.value)}
            type={show ? 'text' : 'password'}
          />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={handleClick}>
              {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id='pic'>
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type='file'
          p={1.5}
          accept='image/*'
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme='blue'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Submit
      </Button>
    </VStack>
  )
}

export default Signup
