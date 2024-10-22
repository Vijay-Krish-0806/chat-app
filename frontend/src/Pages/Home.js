import React, { useEffect } from 'react'
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import { useNavigate } from 'react-router-dom'
const Home = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const user = JSON.stringify(localStorage.getItem('userInfo'))
    console.log('user', user)
    if (user) {
      navigate('/chats')
    }
  }, [navigate])

  return (
    <Container maxW='xl' centerContent>
      <Box
        display='flex'
        justifyContent='center'
        p={1}
        w='100%'
        m='20px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
        bg='white'
      >
        <Text fontSize='2xl' color='black' fontFamily='Work sans'>
          ChatApp
        </Text>
      </Box>
      <Box
        bg='white'
        w='100%'
        p={2}
        borderRadius='lg'
        borderWidth='1px'
        color='black'
      >
        <Tabs variant='soft-rounded'>
          <TabList mb='1em'>
            <Tab color='black' width='50%'>
              Login
            </Tab>
            <Tab color='black' width='50%'>
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Home
