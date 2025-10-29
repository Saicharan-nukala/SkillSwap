// src/pages/NewSwaps/RequestDetailsModal.jsx - SIMPLE WIDER VERSION
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Avatar,
  Text,
  Badge,
  Divider,
  Box,
  useToast,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { FaGraduationCap, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const RequestDetailsModal = ({ isOpen, onClose, request, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleRespond = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      await axios.post(
        `https://skill-swap-backend-h15b.onrender.com/api/swap-requests/${request._id}/respond`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      toast({
        title: 'Response Sent!',
        description: 'You can now chat with this user',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to respond',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent >
        <ModalHeader>
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={`${request.user.firstName} ${request.user.lastName}`}
              src={request.user.avatar}
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">
                {request.user.firstName} {request.user.lastName}
              </Text>
              {request.user.location && (
                <Text fontSize="sm" color="gray.600">
                  {typeof request.user.location === 'string' 
                    ? request.user.location 
                    : request.user.location.city || request.user.location.country}
                </Text>
              )}
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            
            {/* Teaching & Learning Side by Side */}
            <Grid templateColumns="1fr 1fr" gap={6}>
              
              {/* Left - Offering to Teach */}
              <Box>
                <HStack mb={3}>
                  <Icon as={FaGraduationCap} color="green.500" />
                  <Text fontWeight="bold" color="green.600">Offering to Teach</Text>
                </HStack>
                <Box bg="green.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" fontSize="lg" mb={2}>
                    {request.offering.skillName}
                  </Text>
                  <Text fontSize="sm" color="gray.700" mb={3}>
                    {request.offering.description}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="green">{request.offering.experienceLevel}</Badge>
                    {request.offering.category && (
                      <Badge variant="outline">{request.offering.category}</Badge>
                    )}
                  </HStack>
                </Box>
              </Box>

              {/* Right - Looking to Learn */}
              <Box>
                <HStack mb={3}>
                  <Icon as={FaGraduationCap} color="blue.500" />
                  <Text fontWeight="bold" color="blue.600">Looking to Learn</Text>
                </HStack>
                <Box bg="blue.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" fontSize="lg" mb={2}>
                    {request.lookingFor.skillName}
                  </Text>
                  <Text fontSize="sm" color="gray.700" mb={3}>
                    {request.lookingFor.description}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue">{request.lookingFor.experienceLevel}</Badge>
                    {request.lookingFor.category && (
                      <Badge variant="outline">{request.lookingFor.category}</Badge>
                    )}
                  </HStack>
                </Box>
              </Box>
            </Grid>

            <Divider />

            {/* Preferences at Bottom */}
            <Box>
              <Text fontWeight="bold" mb={3}>Session Preferences</Text>
              <HStack spacing={4} flexWrap="wrap">
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="gray.600" />
                  <Text fontSize="sm">{request.preferences?.format || 'Online'}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaClock} color="gray.600" />
                  <Text fontSize="sm">{request.preferences?.sessionDuration || 60} minutes</Text>
                </HStack>
                <HStack>
                  <Icon as={FaClock} color="gray.600" />
                  <Text fontSize="sm">{request.preferences?.frequency || 'Weekly'}</Text>
                </HStack>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleRespond}
            isLoading={loading}
          >
            Respond to Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RequestDetailsModal;
