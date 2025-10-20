'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Container, SimpleGrid, Card, CardBody, Heading, Text, VStack, HStack,
  Avatar, Badge, Icon, Spinner, Center, Button, IconButton, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
  FormControl, FormLabel, Input, Select, Textarea, useToast, Progress, Divider,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, useColorModeValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FaGraduationCap, FaCalendar, FaClock, FaPlus, FaTrash, FaEdit, FaCheckCircle, FaEye,
  FaChevronRight
} from 'react-icons/fa';

import axios from 'axios';

import NavBar from './NavBar';

function TeachingPage() {
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [view, setView] = useState('swaps'); 
  const { isOpen: isSessionOpen, onOpen: onSessionOpen, onClose: onSessionClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const getUserId = () => {
      try {
        let userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user._id || user.id || user.userId || null;
      } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
      }
    };
    const id = getUserId();
    if (id) {
      setCurrentUserId(id);
      fetchSwaps(id);
    } else {
      setLoading(false);
    }
  }, []);
  const handleViewDetails = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };
  const fetchSwaps = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || sessionStorage.getItem('token');

      // Fetch swaps
      const response = await axios.get('http://localhost:5000/api/swaps', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allSwaps = response.data.data || [];
      const teachingSwaps = allSwaps.filter(swap => {
        const isRequester = (swap.requester._id?.toString() === userId?.toString()) || (swap.requester?.toString() === userId?.toString());
        const isReceiver = (swap.receiver._id?.toString() === userId?.toString()) || (swap.receiver?.toString() === userId?.toString());
        return (isRequester || isReceiver) && swap.status === 'accepted';
      });

      // Fetch sessions for each swap and attach them
      const swapsWithSessions = await Promise.all(
        teachingSwaps.map(async (swap) => {
          try {
            const sessionsResponse = await axios.get(
              `http://localhost:5000/api/sessions/swap/${swap._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...swap,
              sessions: sessionsResponse.data.data || []
            };
          } catch (error) {
            console.error(`Error fetching sessions for swap ${swap._id}:`, error);
            return {
              ...swap,
              sessions: []
            };
          }
        })
      );

      setSwaps(swapsWithSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch teaching swaps',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const fetchSwapSessions = async (swap) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:5000/api/sessions/swap/${swap._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let allSessions = response.data.data || [];
      // filter teaching sessions for this user
      const teachingSessions = allSessions.filter(session => {
        const teacherId = session.teacher?._id?.toString() || session.teacher?.toString();
        return teacherId === currentUserId?.toString();
      });
      // Sort sessions most recent first by date descending
      teachingSessions.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
      setSessions(teachingSessions);
      setSelectedSwap(swap);
      setView('sessions');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch sessions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleUpdateTotalSessions = async (totalSessions) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:5000/api/swaps/${selectedSwap._id}/setup`,
        { totalSessions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'Success',
        description: 'Total sessions updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      const updatedSwap = response.data.data;
      setSwaps(prevSwaps => prevSwaps.map(s => s._id === updatedSwap._id ? updatedSwap : s));
      setSelectedSwap(updatedSwap);
      onEditClose();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update total sessions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:5000/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Session Deleted',
        description: 'Session has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchSwapSessions(selectedSwap);
      fetchSwaps(currentUserId);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.log(e);
    }
  };

  const calculateProgress = (swap) => {
    const isRequester = (swap.requester._id?.toString() === currentUserId?.toString()) || (swap.requester?.toString() === currentUserId?.toString());

    const totalSessions = isRequester
      ? (swap.skillExchange?.requesterOffering?.totalSessions || 0)
      : (swap.skillExchange?.receiverOffering?.totalSessions || 0);

    // Filter teaching sessions for current user
    const teachingSessions = (swap.sessions || []).filter(s => {
      const teacherId = s.teacher?._id?.toString() || s.teacher?.toString();
      return teacherId === currentUserId?.toString();
    });

    const completedSessions = teachingSessions.filter(s => s.status === 'completed').length;

    return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  };


  // Get the student and skill info clearly, used all over in UI
  const getTeachingInfo = (swap) => {
    const isRequester = (swap.requester._id?.toString() === currentUserId?.toString()) || (swap.requester?.toString() === currentUserId?.toString());
    const student = isRequester ? swap.receiver : swap.requester;
    const skill = isRequester ? swap.skillExchange?.requesterOffering : swap.skillExchange?.receiverOffering;
    return { student, skill, isRequester };
  };

  const getStatusColor = (status) => {
    const colorMap = {
      completed: 'green',
      scheduled: 'green',
      cancelled: 'red',
      rescheduled: 'orange',
      pending: 'yellow',
    };
    return colorMap[status] || 'gray';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!loading && !currentUserId) {
    return (
      <Container centerContent mt={10}>
        <Heading>Please Log In</Heading>
        <Text mb={4}>You need to log in to view your teaching swaps</Text>
        <Button colorScheme="green" onClick={() => (window.location.href = '/signin')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Center minH="70vh">
        <Spinner size="xl" speed="0.65s" />
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <NavBar >
        <Container maxW="container.lg" pt={6} pb={10}>
          <Breadcrumb mb={4} fontWeight="medium" fontSize="sm" separator={<FaChevronRight />}>
            <BreadcrumbItem isCurrentPage={view === 'swaps'}>
              <BreadcrumbLink
                onClick={() => {
                  setView('swaps');
                  setSelectedSwap(null);
                  setSessions([]);
                }}
                cursor="pointer"
                color='green'
                fontWeight={view === 'swaps' ? 'bold' : 'normal'}
              >
                Teaching Swaps
              </BreadcrumbLink>
            </BreadcrumbItem>

            {view === 'sessions' && (
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink cursor="default" color="gray.500" fontWeight="normal">
                  Sessions with {getTeachingInfo(selectedSwap).student?.firstName || 'Student'}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>
          <HStack justify="space-between">
            <VStack align={"start"}>
              <Heading size="lg" mb={2}>
                {view === 'swaps' ? 'My Teaching Swaps' : 'Teaching Sessions'}
              </Heading>
              <Text mb={6} color="gray.500">
                {view === 'swaps'
                  ? `Manage your ${swaps.length} active teaching swap${swaps.length !== 1 ? 's' : ''}`
                  : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} scheduled`}
              </Text>
            </VStack>
            {view === 'sessions' && (
              <HStack spacing={3} mb={6}>
                <Button colorScheme="blue" variant="outline" size="md" onClick={onEditOpen}>
                  Edit Total Sessions
                </Button>
                <Button colorScheme="green" size="md" boxShadow="md" onClick={onSessionOpen}>
                  Add New Session
                </Button>
                <Button variant="ghost" onClick={() => {
                  setView('swaps');
                  setSelectedSwap(null);
                  setSessions([]);
                }}>
                  Back to Swaps
                </Button>
              </HStack>
            )}
          </HStack>
          {view === 'swaps' && swaps.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              {swaps.map((swap) => {
                const { student, skill } = getTeachingInfo(swap);
                const totalSessions = skill?.totalSessions || 0;
                const progress = calculateProgress(swap);
                const teachingSessions = swap.sessions?.filter(s => {
                  const teacherId = s.teacher?._id?.toString() || s.teacher?.toString();
                  return teacherId === currentUserId?.toString();
                }) || [];
                const completedCount = teachingSessions.filter(s => s.status === 'completed').length;

                return (
                  <Card
                    key={swap._id}
                    bg={cardBg}
                    borderWidth={1}
                    borderColor={borderColor}
                    cursor="pointer"
                    shadow="md"
                    _hover={{ shadow: 'lg' }}
                    onClick={() => fetchSwapSessions(swap)}
                  >
                    <CardBody>
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={3}>
                          <Avatar name={`${student?.firstName} ${student?.lastName}`} size="md" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                              {student?.firstName} {student?.lastName}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                              {student?.email}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme="green" fontSize="sm">
                          {skill?.skillName || 'Skill'}
                        </Badge>
                      </HStack>

                      <Divider mb={3} />

                      <Text mb={2} fontSize="sm" color="gray.600">
                        Session Progress: {completedCount}/{totalSessions > 0 ? totalSessions : '?'}{' '}
                        {totalSessions > 0 ? `(${Math.round(progress)}% complete)` : 'Set total sessions to track progress'}
                      </Text>

                      <Progress value={progress} size="sm" colorScheme="green" mb={4} />

                      <HStack justify="space-between" fontSize="sm" color="gray.600">
                        <Text>Total Sessions: {teachingSessions.length}</Text>
                        <Text>Completed: {completedCount}</Text>
                      </HStack>

                      <Button mt={4} colorScheme="green" size="sm" width="full" onClick={() => fetchSwapSessions(swap)}>
                        View All Sessions <FaChevronRight style={{ marginLeft: 6 }} />
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}

          {view === 'swaps' && swaps.length === 0 && (
            <Center flexDirection="column" pt={20}>
              <Text fontSize="xl" color="gray.600" mb={4}>
                No Teaching Swaps Yet
              </Text>
              <Text color="gray.500" mb={6}>
                Accept swap requests to start teaching
              </Text>
              <Button colorScheme="green" size="lg" onClick={() => (window.location.href = '/swaps')}>
                Browse Available Swaps
              </Button>
            </Center>
          )}

          {view === 'sessions' && (
            <>
              <Heading size="md" my={6}>
                Sessions with {getTeachingInfo(selectedSwap).student?.firstName}{' '}
                {getTeachingInfo(selectedSwap).student?.lastName}
              </Heading>

              {sessions.length === 0 ? (
                <Center flexDirection="column" pt={10}>
                  <Text fontSize="lg" color="gray.600" mb={4}>
                    No Sessions Scheduled Yet
                  </Text>
                  <Button colorScheme="green" size="lg" onClick={onSessionOpen}>
                    Create First Session
                  </Button>
                </Center>
              ) : (
                <VStack spacing={4} align="stretch">
                  {sessions.map(session => (
                    <Card key={session._id} bg={cardBg} borderWidth={1} borderColor={borderColor}>
                      <CardBody>
                        <HStack justify="space-between">
                          <Heading size="sm">{session.title}</Heading>
                          <HStack spacing={3}>
                            <Badge colorScheme={getStatusColor(session.status)}>{session.status}</Badge>
                            <IconButton
                              aria-label="Delete session"
                              icon={<FaTrash />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSession(session._id)}
                            />
                          </HStack>
                        </HStack>

                        <Text fontSize="sm" color="gray.500" mt={1}>
                          {formatDate(session.scheduledDate)} | {session.startTime} - {session.endTime}{' '}
                          {session.format && `| ${session.format.toUpperCase()}`}
                        </Text>

                        {session.location && (
                          <Text fontSize="sm" mt={1} color="gray.600">
                            {session.location}
                          </Text>
                        )}

                        {session.description && (
                          <Text mt={2} fontSize="sm" color="gray.700">
                            {session.description}
                          </Text>
                        )}
                        {/* View Details Button */}
                        <Button
                          leftIcon={<FaEye />}
                          colorScheme="green"
                          variant="outline"
                          w="full"
                          onClick={() => handleViewDetails(session._id)}
                        >
                          View Details
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </>
          )}

          {/* Modals */}

          <EditTotalSessionsModal
            isOpen={isEditOpen}
            onClose={onEditClose}
            swap={selectedSwap}
            currentUserId={currentUserId}
            onUpdate={handleUpdateTotalSessions}
          />

          <CreateSessionModal
            isOpen={isSessionOpen}
            onClose={onSessionClose}
            swap={selectedSwap}
            currentUserId={currentUserId}
            onSuccess={() => fetchSwapSessions(selectedSwap)}
          />
        </Container>
      </NavBar>
    </Box>
  );
}

// Modal to edit total sessions planned for swap
const EditTotalSessionsModal = ({ isOpen, onClose, swap, currentUserId, onUpdate }) => {
  const getInitialTotalSessions = () => {
    if (!swap || !currentUserId) return 1;
    const isRequester = (swap.requester._id?.toString() === currentUserId?.toString()) || (swap.requester?.toString() === currentUserId?.toString());
    return isRequester
      ? (swap.skillExchange?.requesterOffering?.totalSessions || 1)
      : (swap.skillExchange?.receiverOffering?.totalSessions || 1);
  };

  const [totalSessions, setTotalSessions] = React.useState(getInitialTotalSessions());

  React.useEffect(() => {
    setTotalSessions(getInitialTotalSessions());
  }, [swap]);

  const handleSubmit = () => {
    if (totalSessions < 1) return;
    onUpdate(totalSessions);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Total Sessions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>Set the total number of sessions you plan to teach for this swap.</Text>
          <FormControl>
            <FormLabel>Total Number of Sessions</FormLabel>
            <NumberInput
              value={totalSessions}
              onChange={(valueString, valueNumber) => setTotalSessions(valueNumber)}
              min={1}
              max={100}
              size="lg"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <Text fontSize="sm" color="gray.500" mt={2}>
            This helps track your progress through the swap.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="green" onClick={handleSubmit}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Modal to create a new teaching session, showing swap student and skill info
const CreateSessionModal = ({ isOpen, onClose, swap, currentUserId, onSuccess }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    format: 'online',
    location: '',
  });

  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  const { student, skill } = React.useMemo(() => {
    if (!swap || !currentUserId) return { student: null, skill: null };
    const isRequester = (swap.requester._id?.toString() === currentUserId?.toString()) || (swap.requester?.toString() === currentUserId?.toString());
    const student = isRequester ? swap.receiver : swap.requester;
    const skill = isRequester ? swap.skillExchange?.requesterOffering : swap.skillExchange?.receiverOffering;
    return { student, skill };
  }, [swap, currentUserId]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.scheduledDate || !formData.startTime || !formData.endTime || !formData.location) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate duration from start and end time
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;

      // Validate duration
      if (duration <= 0) {
        toast({
          title: 'Invalid Time',
          description: 'End time must be after start time',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

      await axios.post(
        'http://localhost:5000/api/sessions',
        {
          ...formData,
          swap: swap._id,
          duration: duration  // Add calculated duration
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Session Created',
        description: 'Your teaching session has been scheduled successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        title: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        format: 'online',
        location: '',
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Schedule Teaching Session for {student?.firstName} {student?.lastName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4} fontSize="md" fontWeight="semibold" color="gray.700">
            Teaching Skill: {skill?.skillName || 'Unknown Skill'}
          </Box>

          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Session Title</FormLabel>
              <Input
                placeholder="e.g., React Fundamentals - Part 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Brief description of what you'll cover in this session"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Format</FormLabel>
                <Select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  size="lg"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>{formData.format === 'online' ? 'Meeting Link' : 'Location'}</FormLabel>
              <Input
                placeholder={formData.format === 'online' ? 'Zoom, Google Meet, or Teams link' : 'Physical address or room number'}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                size="lg"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="green" isLoading={loading} onClick={handleSubmit}>
            Create Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeachingPage;
