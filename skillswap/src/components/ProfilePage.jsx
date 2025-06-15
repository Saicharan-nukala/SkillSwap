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
      <NavBar>
      <Flex direction="column" align="center" position="relative" pb={10} bg="gray.50">
        <ProfileScrollPage/>
      </Flex>
      </NavBar>
    </>
  )
}

export default ProfilePage;