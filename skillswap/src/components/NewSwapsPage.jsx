// src/pages/NewSwaps/NewSwapsPage.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Badge,
  HStack,
  VStack,
  Flex,
  useDisclosure,
  Spinner,
  Center,
  Icon,
  Divider,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaPlus, FaGraduationCap, FaClock, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import PostRequestModal from './PostRequestModal';
import RequestDetailsModal from './RequestDetailsModal';
import NavBar from './NavBar';

const NewSwapsPage = () => {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose
  } = useDisclosure();

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

      const response = await axios.get('http://localhost:5000/api/swap-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setRequests(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    onDetailsOpen();
  };

  // Filter requests based on search
  const filteredRequests = requests.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.offering.skillName.toLowerCase().includes(query) ||
      request.lookingFor.skillName.toLowerCase().includes(query) ||
      request.user.firstName.toLowerCase().includes(query) ||
      request.user.lastName.toLowerCase().includes(query)
    );
  });

  return (
    <NavBar>
      <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 8 }}>
        <Container maxW="container.xl">

          <VStack spacing={{ base: 4, md: 6 }} align="stretch" mb={{ base: 6, md: 8 }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              gap={4}
            >
              <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                <Heading size={{ base: 'lg', md: 'xl' }} color="blue.600">
                  Skill Swap Marketplace
                </Heading>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                  Find your perfect learning partner
                </Text>
              </VStack>

              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                size={{ base: 'md', md: 'lg' }}
                onClick={onOpen}
                boxShadow="md"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                width={{ base: 'full', md: 'auto' }}
              >
                Post Your Request
              </Button>
            </Flex>

            {/* Search Bar */}
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="md">
              <InputGroup size={{ base: 'md', md: 'lg' }}>
                <InputLeftElement pointerEvents="none" height="full">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by skill or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="lg"
                  bg="gray.50"
                  fontSize={{ base: 'sm', md: 'md' }}
                  _focus={{
                    bg: 'white',
                    borderColor: 'blue.400',
                    boxShadow: 'outline'
                  }}
                />
              </InputGroup>

              {searchQuery && (
                <Text mt={3} color="gray.600" fontSize="sm">
                  {filteredRequests.length} {filteredRequests.length === 1 ? 'result' : 'results'} found
                </Text>
              )}
            </Box>
          </VStack>

          {/* Requests Grid */}
          {loading ? (
            <Center h="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text color="gray.500">Loading requests...</Text>
              </VStack>
            </Center>
          ) : filteredRequests.length === 0 ? (
            <Center h="400px">
              <VStack spacing={4}>
                <Icon as={FaGraduationCap} boxSize={16} color="gray.300" />
                <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.500" textAlign="center">
                  {searchQuery ? 'No matching requests found' : 'No requests yet'}
                </Text>
                {!searchQuery && (
                  <Button colorScheme="blue" onClick={onOpen}>
                    Post First Request
                  </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 2, xl: 3 }} spacing={{ base: 4, md: 6 }}>
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onViewDetails={handleViewRequest}
                  navigate={navigate}
                />
              ))}
            </SimpleGrid>
          )}

          {/* Modals */}
          <PostRequestModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={fetchAllRequests}
          />

          {selectedRequest && (
            <RequestDetailsModal
              isOpen={isDetailsOpen}
              onClose={onDetailsClose}
              request={selectedRequest}
              onSuccess={fetchAllRequests}
            />
          )}
        </Container>
      </Box>
    </NavBar>
  );
};

// Request Card Component - FIXED
const RequestCard = ({ request, onViewDetails, navigate }) => {
  const getLocationString = (location) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      return location.city || location.country || '';
    }
    return '';
  };

  return (
    <Card
      overflow="hidden"
      borderRadius="xl"
      boxShadow="md"
      bg="white"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        cursor: 'pointer'
      }}
      onClick={() => onViewDetails(request)}
      height="100%"
    >
      {/* User Header */}
      <CardHeader bg="blue.50" pb={3}>
        <HStack spacing={3}>
          <Avatar
            size={{ base: 'md', md: 'lg' }}
            name={`${request.user.firstName} ${request.user.lastName}`}
            src={request.user.avatar}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              navigate(`/profile/${request.user._id || request.user.id}`);
            }}
            _hover={{
              transform: 'scale(1.1)',
              transition: 'all 0.2s',
              boxShadow: 'lg'
            }}
            border="3px solid white"
            boxShadow="sm"
          />

          <VStack align="start" spacing={0} flex={1}>
            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
              {request.user.firstName} {request.user.lastName}
            </Text>
            {request.user.location && (
              <HStack spacing={1} fontSize="xs" color="gray.600">
                <Icon as={FaMapMarkerAlt} />
                <Text>{getLocationString(request.user.location)}</Text>
              </HStack>
            )}
          </VStack>

          <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
            Open
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack align="stretch" spacing={4}>

          {/* Offering Section */}
          <Box>
            <HStack mb={2} spacing={2}>
              <Icon as={FaGraduationCap} color="green.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="bold" color="green.600">
                Offering to Teach
              </Text>
            </HStack>
            <Box
              bg="green.50"
              p={3}
              borderRadius="md"
              borderLeft="3px solid"
              borderColor="green.500"
            >
              <Text fontWeight="semibold" fontSize="md" mb={1} noOfLines={1}>
                {request.offering.skillName}
              </Text>
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {request.offering.description}
              </Text>
              <Wrap mt={2} spacing={2}>
                <WrapItem>
                  <Badge colorScheme="green" fontSize="xs">
                    {request.offering.experienceLevel}
                  </Badge>
                </WrapItem>
                {request.offering.category && (
                  <WrapItem>
                    <Badge variant="outline" fontSize="xs" colorScheme="green">
                      {request.offering.category}
                    </Badge>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
          </Box>

          <Divider />

          {/* Looking For Section */}
          <Box>
            <HStack mb={2} spacing={2}>
              <Icon as={FaGraduationCap} color="blue.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="bold" color="blue.600">
                Looking to Learn
              </Text>
            </HStack>
            <Box
              bg="blue.50"
              p={3}
              borderRadius="md"
              borderLeft="3px solid"
              borderColor="blue.500"
            >
              <Text fontWeight="semibold" fontSize="md" mb={1} noOfLines={1}>
                {request.lookingFor.skillName}
              </Text>
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {request.lookingFor.description}
              </Text>
              <Wrap mt={2} spacing={2}>
                <WrapItem>
                  <Badge colorScheme="blue" fontSize="xs">
                    {request.lookingFor.experienceLevel}
                  </Badge>
                </WrapItem>
                {request.lookingFor.category && (
                  <WrapItem>
                    <Badge variant="outline" fontSize="xs" colorScheme="blue">
                      {request.lookingFor.category}
                    </Badge>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
          </Box>

          {/* Preferences */}
          <Wrap spacing={3} fontSize="xs" color="gray.600">
            <WrapItem>
              <HStack spacing={1}>
                <Icon as={FaMapMarkerAlt} />
                <Text>{request.preferences?.format || 'Online'}</Text>
              </HStack>
            </WrapItem>
            <WrapItem>
              <HStack spacing={1}>
                <Icon as={FaClock} />
                <Text>{request.preferences?.sessionDuration || 60} min</Text>
              </HStack>
            </WrapItem>
            <WrapItem>
              <HStack spacing={1}>
                <Icon as={FaCalendar} />
                <Text>{request.preferences?.frequency || 'Weekly'}</Text>
              </HStack>
            </WrapItem>
          </Wrap>

          {/* View Details Button */}
          <Button
            colorScheme="blue"
            size="sm"
            width="full"
            mt={2}
          >
            View Details & Respond
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default NewSwapsPage;
