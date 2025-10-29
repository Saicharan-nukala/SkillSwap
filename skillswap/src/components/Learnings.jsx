'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Container, SimpleGrid, Card, CardBody, Heading, Text, VStack, HStack,
  Avatar, Badge, Icon, Spinner, Center, Button, IconButton,
  useToast, Progress, Divider, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserGraduate, FaCalendar, FaClock, FaEye, FaChevronRight, FaGraduationCap
} from 'react-icons/fa';
import axios from 'axios';
import NavBar from './NavBar';

function LearningPage() {
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [view, setView] = useState('swaps'); // swaps or sessions
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

      const response = await axios.get('https://skill-swap-backend-h15b.onrender.com/api/swaps', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allSwaps = response.data.data || [];
      const learningSwaps = allSwaps.filter(swap => {
        const isRequester = (swap.requester._id?.toString() === userId?.toString()) || (swap.requester?.toString() === userId?.toString());
        const isReceiver = (swap.receiver._id?.toString() === userId?.toString()) || (swap.receiver?.toString() === userId?.toString());
        return (isRequester || isReceiver) && swap.status === 'accepted';
      });

      // Fetch sessions for each swap
      const swapsWithSessions = await Promise.all(
        learningSwaps.map(async (swap) => {
          try {
            const sessionsResponse = await axios.get(
              `https://skill-swap-backend-h15b.onrender.com/api/sessions/swap/${swap._id}`,
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
        description: 'Failed to fetch learning swaps',
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
      const response = await axios.get(`https://skill-swap-backend-h15b.onrender.com/api/sessions/swap/${swap._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let allSessions = response.data.data || [];

      // Filter learning sessions (where user is learner)
      const learningSessions = allSessions.filter(session => {
        const learnerId = session.learner?._id?.toString() || session.learner?.toString();
        return learnerId === currentUserId?.toString();
      });

      // Sort by date descending (most recent first)
      learningSessions.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

      setSessions(learningSessions);
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

  // Get the teacher and skill info clearly, used all over in UI
  const getLearningInfo = (swap) => {
    const isRequester = (swap.requester._id?.toString() === currentUserId?.toString()) || (swap.requester?.toString() === currentUserId?.toString());

    // Teacher is the opposite person
    const teacher = isRequester ? swap.receiver : swap.requester;

    // Learning skill is opposite of teaching skill
    const skill = isRequester
      ? swap.skillExchange?.receiverOffering
      : swap.skillExchange?.requesterOffering;
      
    // Use first name for breadcrumb consistency
    const teacherName = teacher?.firstName || teacher?.name || 'Teacher';

    return { teacher, skill, isRequester, teacherName };
  };

  const calculateProgress = (swap) => {
    const isRequester = (swap.requester._id?.toString() === currentUserId?.toString()) || (swap.requester?.toString() === currentUserId?.toString());

    // For learning, get the skill being learned (opposite of teaching)
    const totalSessions = isRequester
      ? (swap.skillExchange?.receiverOffering?.totalSessions || 0)
      : (swap.skillExchange?.requesterOffering?.totalSessions || 0);

    // Filter learning sessions
    const learningSessions = (swap.sessions || []).filter(s => {
      const learnerId = s.learner?._id?.toString() || s.learner?.toString();
      return learnerId === currentUserId?.toString();
    });

    const completedSessions = learningSessions.filter(s => s.status === 'completed').length;

    return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      completed: 'green',
      scheduled: 'blue',
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
        <Text mb={4}>You need to log in to view your learning swaps</Text>
        <Button colorScheme="blue" onClick={() => navigate('/signin')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Center minH="70vh">
        <Spinner size="xl" speed="0.65s" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <NavBar>
        <Container maxW="container.lg" pt={6} pb={10}>
          {/* Breadcrumb - Matches Teachings.jsx structure */}
          <Breadcrumb mb={4} fontWeight="medium" fontSize="sm" separator={<FaChevronRight />}>
            <BreadcrumbItem isCurrentPage={view === 'swaps'}>
              <BreadcrumbLink
                onClick={() => {
                  setView('swaps');
                  setSelectedSwap(null);
                  setSessions([]);
                }}
                cursor="pointer"
                color={view === 'swaps' ? 'blue.600' : 'gray.600'}
                fontWeight={view === 'swaps' ? 'bold' : 'normal'}
              >
                Learning Swaps
              </BreadcrumbLink>
            </BreadcrumbItem>

            {view === 'sessions' && selectedSwap && (
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink cursor="default" color="gray.500" fontWeight="normal">
                  Sessions with {getLearningInfo(selectedSwap).teacherName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>
          
          {/* Header and Actions - Matches Teachings.jsx structure */}
          <HStack justify="space-between">
            <VStack align={"start"}>
              <Heading size="lg" mb={2}>
                {view === 'swaps' ? 'My Learning Swaps' : 'Learning Sessions'}
              </Heading>
              <Text mb={6} color="gray.500">
                {view === 'swaps'
                  ? `Manage your ${swaps.length} active learning swap${swaps.length !== 1 ? 's' : ''}`
                  : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} scheduled`
                }
              </Text>
            </VStack>
            {view === 'sessions' && (
              <HStack spacing={3} mb={6}>
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
          
          {/* Main Content */}
          {view === 'swaps' && swaps.length > 0 && (
            // Swaps View - Matches Teachings.jsx structure
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              {swaps.map((swap) => {
                const { teacher, skill } = getLearningInfo(swap);
                const totalSessions = skill?.totalSessions || 0;
                const progress = calculateProgress(swap);
                const learningSessions = swap.sessions?.filter(s => {
                  const learnerId = s.learner?._id?.toString() || s.learner?.toString();
                  return learnerId === currentUserId?.toString();
                }) || [];
                const completedCount = learningSessions.filter(s => s.status === 'completed').length;
                
                // Use teacher's first name if available, otherwise full name
                const teacherName = teacher?.firstName ? `${teacher.firstName} ${teacher.lastName}` : (teacher?.name || 'Teacher');

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
                          <Avatar name={teacherName} size="md" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                              {teacherName}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                              Your Teacher
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme="blue" fontSize="sm">
                          {skill?.skillName || 'Skill'}
                        </Badge>
                      </HStack>

                      <Divider mb={3} />

                      <Text mb={2} fontSize="sm" color="gray.600">
                        Session Progress: {completedCount}/{totalSessions > 0 ? totalSessions : '?'}{' '}
                        {totalSessions > 0 ? `(${Math.round(progress)}% complete)` : 'Teacher has not set total sessions'}
                      </Text>

                      <Progress value={progress} size="sm" colorScheme="blue" mb={4} />

                      <HStack justify="space-between" fontSize="sm" color="gray.600">
                        <Text>Total Sessions: {learningSessions.length}</Text>
                        <Text>Completed: {completedCount}</Text>
                      </HStack>

                      <Button mt={4} colorScheme="blue" size="sm" width="full" rightIcon={<FaChevronRight />}
                         onClick={(e) => { e.stopPropagation(); fetchSwapSessions(swap); }}>
                        View All Sessions
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}

          {view === 'swaps' && swaps.length === 0 && (
            <Center flexDirection="column" pt={20}>
              <Icon as={FaGraduationCap} boxSize={16} color="gray.300" mb={4} />
              <Text fontSize="xl" color="gray.600" mb={4}>
                No Learning Swaps Yet
              </Text>
              <Text color="gray.500" mb={6}>
                Accept swap requests or create new requests to start learning
              </Text>
              <Button colorScheme="blue" size="lg" onClick={() => navigate('/swaps')}>
                Browse Available Swaps
              </Button>
            </Center>
          )}

          {view === 'sessions' && (
            // Sessions View - Matches Teachings.jsx structure (VStack of Cards)
            <>
              <Heading size="md" my={6}>
                Sessions with {getLearningInfo(selectedSwap).teacherName}
              </Heading>

              {sessions.length === 0 ? (
                <Center flexDirection="column" pt={10}>
                  <Icon as={FaCalendar} boxSize={16} color="gray.300" mb={4} />
                  <Text fontSize="lg" color="gray.600" mb={4}>
                    No Sessions Scheduled Yet
                  </Text>
                  <Text color="gray.500">
                    Your teacher has not scheduled the first session yet.
                  </Text>
                </Center>
              ) : (
                <VStack spacing={4} align="stretch">
                  {sessions.map(session => (
                    <Card key={session._id} bg={cardBg} borderWidth={1} borderColor={borderColor}>
                      <CardBody>
                        <HStack justify="space-between">
                          <Heading size="sm" noOfLines={1}>{session.title}</Heading>
                          {/* Only show badge, no actions */}
                          <Badge colorScheme={getStatusColor(session.status)}>{session.status}</Badge>
                        </HStack>

                        <Text fontSize="sm" color="gray.500" mt={1}>
                          {formatDate(session.scheduledDate)} | {session.startTime} - {session.endTime}{' '}
                          {session.format && `| ${session.format.toUpperCase()}`}
                        </Text>

                        {session.location && (
                          <Text fontSize="sm" mt={1} color="gray.600" noOfLines={1}>
                            {session.location}
                          </Text>
                        )}

                        {session.description && (
                          <Text mt={2} fontSize="sm" color="gray.700" noOfLines={2}>
                            {session.description}
                          </Text>
                        )}
                       
                        <Button
                          mt={3}
                          leftIcon={<FaEye />}
                          colorScheme="blue"
                          variant="outline" // Changed to outline for consistent look with teaching page view details
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

        </Container>
      </NavBar>
    </Box>
  );
}

export default LearningPage;