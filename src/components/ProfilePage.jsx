'use client'

import NavBar from "./NavBar";
import ProfileScrollPage from "./profileScrollPage";
import {
  Box,
  Image,
  Flex,
  Avatar,
  Text,
  Heading,
  VStack,
  Button,
  Divider,
  Card,
  CardBody,
  SimpleGrid,
  Icon
} from '@chakra-ui/react'
import { FiUser, FiUsers, FiFileText } from 'react-icons/fi'

function ProfilePage() {
  return (
    <>
      <NavBar />
      <Flex direction="column" align="center" position="relative" pb={10} bg="gray.50">
        {/* <Box>
          <Flex direction="column" align="center" gap={2} my={5} width="30vw" >
              <Avatar
                size="xl">
              </Avatar>
              <Heading  fontWeight="">
                Sai Charan
              </Heading>
              <Text align="center">
                FullStack Development | Gen AI | 
              </Text>
          </Flex>
        </Box> */}
        <ProfileScrollPage/>
      </Flex>
    </>
  )
}

export default ProfilePage;