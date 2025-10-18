// src/pages/Connections/ConnectionsPage.jsx - PROFESSIONAL VERSION

'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  VStack,
  Avatar,
  Badge,
  Icon,
  Spinner,
  Center,
  Card,
  CardBody,
  Button,
  IconButton,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  FaHandshake,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaComments,
  FaCalendarAlt,
  FaEllipsisV,
  FaUserFriends,
  FaFire,
} from 'react-icons/fa';
import axios from 'axios';
import NavBar from './NavBar';

function ConnectionsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        let userId = null;
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user._id || user.id || user.userId;
            console.log('User ID found:', userId);
          } catch (e) {
            console.error('Error parsing user:', e);
          }
        }

        if (userId) {
          setCurrentUserId(userId);
          await fetchAllData(userId);
        } else {
          console.log('No user ID - showing empty state');
          setLoading(false);
          setSwaps([]);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
      }
    };
    initializePage();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('token');
      console.log('Fetching data with token:', token ? 'Found' : 'Not found');

      const [swapsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/swaps', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/swaps/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: { data: {} } }))
      ]);

      console.log('Swaps fetched:', swapsRes.data.data?.length || 0);
      setSwaps(swapsRes.data.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (swapId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      await axios.put(`http://localhost:5000/api/swaps/${swapId}/accept`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast({
        title: 'Connection Accepted! 🎉',
        description: 'You can now start your learning journey',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAllData(currentUserId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept connection',
        status: 'error',
        duration: 3000,
      });
      console.log(error)
    }
  };

  const handleReject = async (swapId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      await axios.put(`http://localhost:5000/api/swaps/${swapId}/reject`,
        { reason: 'Not interested' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast({
        title: 'Connection Declined',
        status: 'info',
        duration: 3000,
      });
      fetchAllData(currentUserId);
    } catch (error) {
      toast({
        title: 'Error',
        status: 'error',
        duration: 3000,
      });
      console.log(error);
    }
  };

  if (loading) {
    return (
      <NavBar>
        <Center h="100vh" bg="gray.50">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="blue.500" />
            <Text color="gray.600" fontSize="lg">Loading connections...</Text>
          </VStack>
        </Center>
      </NavBar>
    );
  }

  const acceptedSwaps = swaps.filter(s => s.status === 'accepted');
  const pendingSwaps = swaps.filter(s => s.status === 'pending');
  const completedSwaps = swaps.filter(s => s.status === 'completed');

  return (
    <NavBar>
      <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 8 }}>
        <Container maxW="container.2xl">
          
          {/* Header */}
          <VStack spacing={6} align="stretch" mb={8}>
            <HStack spacing={3}>
              <Icon as={FaUserFriends} boxSize={10} color="blue.500" />
              <VStack align="start" spacing={0}>
                <Heading size={{ base: 'lg', md: 'xl' }}>My Learning Network</Heading>
                <Text color="gray.600">Connect, Learn, and Grow Together</Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Main Content */}
          <Tabs colorScheme="blue" variant="soft-rounded">
            <TabList mb={6} flexWrap="wrap" gap={2}>
              <Tab _selected={{ bg: 'blue.500', color: 'white' }}>
                <HStack>
                  <Icon as={FaFire} />
                  <Text>Accepted ({acceptedSwaps.length})</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ bg: 'gray.600', color: 'white' }}>
                <HStack>
                  <Icon as={FaClock} />
                  <Text>Pending ({pendingSwaps.length})</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ bg: 'gray.600', color: 'white' }}>
                <HStack>
                  <Icon as={FaCheckCircle} />
                  <Text>Completed ({completedSwaps.length})</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* accepted Connections */}
              <TabPanel p={0}>
                {acceptedSwaps.length === 0 ? (
                  <EmptyState 
                    icon={FaHandshake}
                    title="No accepted Connections"
                    description="Start learning by accepting pending requests or finding new partners!"
                  />
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {acceptedSwaps.map(swap => (
                      <ConnectionCard
                        key={swap._id}
                        swap={swap}
                        currentUserId={currentUserId}
                        type="accepted"
                        navigate={navigate}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* Pending Requests */}
              <TabPanel p={0}>
                {pendingSwaps.length === 0 ? (
                  <EmptyState 
                    icon={FaClock}
                    title="No Pending Requests"
                    description="All caught up! Check out the marketplace to find new learning partners."
                  />
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {pendingSwaps.map(swap => (
                      <ConnectionCard
                        key={swap._id}
                        swap={swap}
                        currentUserId={currentUserId}
                        type="pending"
                        onAccept={() => handleAccept(swap._id)}
                        onReject={() => handleReject(swap._id)}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* Completed */}
              <TabPanel p={0}>
                {completedSwaps.length === 0 ? (
                  <EmptyState 
                    icon={FaCheckCircle}
                    title="No Completed Swaps"
                    description="Complete your accepted connections to see them here!"
                  />
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {completedSwaps.map(swap => (
                      <ConnectionCard
                        key={swap._id}
                        swap={swap}
                        currentUserId={currentUserId}
                        type="completed"
                      />
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </NavBar>
  );
}

// Connection Card Component - PROFESSIONAL LAYOUT
const ConnectionCard = ({ swap, currentUserId, type, onAccept, onReject, navigate }) => {
  if (!swap || !currentUserId) return null;
  
  const isRequester = swap.requester._id?.toString() === currentUserId?.toString();
  const partner = isRequester ? swap.receiver : swap.requester;
  const iTeach = isRequester ? swap.skillExchange.requesterOffering : swap.skillExchange.receiverOffering;
  const iLearn = isRequester ? swap.skillExchange.receiverOffering : swap.skillExchange.requesterOffering;
  
  const isPending = type === 'pending';
  const canAccept = isPending && !isRequester;

  return (
    <Card 
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'gray.300' }}
      transition="all 0.3s"
      borderRadius="lg"
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          
          {/* Partner Info */}
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Avatar 
                size="lg" 
                name={`${partner.firstName} ${partner.lastName}`}
                src={partner.avatar}
                bg="gray.300"
              />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" fontSize="lg" color="gray.800">
                  {partner.firstName} {partner.lastName}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="500">
                  {partner.intrest}
                </Text>
              </VStack>
            </HStack>
          </HStack>

          <Divider />

          {/* Skills Exchange - ONLY COLORS HERE */}
          <SimpleGrid columns={2} gap={3}>
            <Tooltip label={iTeach.description}>
              <Box 
                bg="blue.50" 
                p={3} 
                borderRadius="md"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="blue.700" fontWeight="600" textTransform="uppercase">
                    I Teach
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
                    {iTeach.skillName}
                  </Text>
                </VStack>
              </Box>
            </Tooltip>
            
            <Tooltip label={iLearn.description}>
              <Box 
                bg="green.50" 
                p={3} 
                borderRadius="md"
                borderWidth="1px"
                borderColor="green.200"
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="green.700" fontWeight="600" textTransform="uppercase">
                    I Learn
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
                    {iLearn.skillName}
                  </Text>
                </VStack>
              </Box>
            </Tooltip>
          </SimpleGrid>

          {/* Action Buttons */}
          {canAccept ? (
            <>
              <Divider />
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onClick={onReject}
                  flex={1}
                  fontWeight="500"
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={onAccept}
                  flex={1}
                  fontWeight="500"
                >
                  Accept
                </Button>
              </HStack>
            </>
          ) : type === 'accepted' && navigate ? (
            <>
              <Divider />
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FaComments />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => navigate('/chats')}
                  flex={1}
                  fontWeight="500"
                >
                  Chat
                </Button>
                <Button
                  size="sm"
                  leftIcon={<FaCalendarAlt />}
                  colorScheme="blue"
                  onClick={() => navigate('/learning')}
                  flex={1}
                  fontWeight="500"
                >
                  Sessions
                </Button>
              </HStack>
            </>
          ) : isPending && isRequester ? (
            <>
              <Divider />
              <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                Waiting for {partner.firstName}'s response...
              </Text>
            </>
          ) : null}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, description }) => (
  <Center py={16}>
    <VStack spacing={4}>
      <Icon as={icon} boxSize={20} color="gray.300" />
      <Heading size="md" color="gray.500">{title}</Heading>
      <Text color="gray.400" textAlign="center" maxW="md">{description}</Text>
    </VStack>
  </Center>
);

export default ConnectionsPage;
