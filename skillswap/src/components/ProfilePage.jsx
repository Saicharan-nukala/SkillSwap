// ProfilePage.jsx
'use client'

import React from 'react';
import NavBar from "./NavBar";
import ProfileScrollPage from "./profileScrollPage";
import { useParams } from 'react-router-dom';
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
  const { userId } = useParams();

  // Determine if the profile being viewed is the current user's profile
  // This logic should be expanded based on your authentication system
  const isViewMode = false; // Placeholder
  console.log(userId);
  if (!userId) {
    return (
      <NavBar>
        <Flex direction="column" align="center" position="relative" pb={10} bg="gray.50">
          <Text fontSize="xl" color="red.500">Error: User ID not found in URL. Please navigate to a specific user's profile (e.g., /profile/your_id).</Text>
        </Flex>
      </NavBar>
    );
  }

  return (
    <NavBar>
      {/* Pass userId and isViewMode as props to ProfileScrollPage */}
      <ProfileScrollPage userId={userId} isViewMode={isViewMode} />
    </NavBar>
  );
}

export default ProfilePage;