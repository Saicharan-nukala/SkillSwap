// ProfilePage.jsx

'use client'

import React, { useEffect, useState } from 'react';
import NavBar from "./NavBar";
import ProfileScrollPage from "./ProfileScrollPage";
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
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    // Get the current logged-in user's ID from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser?.userId || currentUser?._id;

    // Set isViewMode to true if viewing someone else's profile
    setIsViewMode(userId !== currentUserId);

    console.log('Viewing userId:', userId);
    console.log('Current userId:', currentUserId);
    console.log('isViewMode:', userId !== currentUserId);
  }, [userId]);

  if (!userId) {
    return (
      <Box>
        <NavBar>
          <Text>Error: User ID not found in URL. Please navigate to a specific user's profile (e.g., /profile/your_id).</Text>
        </NavBar>
      </Box>
    );
  }

  return (
    <Box>
      <NavBar >
        <ProfileScrollPage userId={userId} isViewMode={isViewMode} />
      </NavBar>
    </Box>
  );
}

export default ProfilePage;
