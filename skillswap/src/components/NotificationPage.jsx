// NotificationsPage.jsx - COMPLETE & REALISTIC
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Badge,
  Icon,
  Spinner,
  Center,
  Progress,
} from '@chakra-ui/react';
import {
  FaBell,
  FaCheckCircle,
  FaHandshake,
  FaClock,
  FaGraduationCap,
  FaTrophy,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user') || '{}';
      const userId = JSON.parse(userStr)._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const [swapsRes, sessionsRes] = await Promise.all([
        axios.get('https://skill-swap-backend-h15b.onrender.com/api/swaps', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('https://skill-swap-backend-h15b.onrender.com/api/sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } }))
      ]);

      const swaps = swapsRes.data.data || [];
      const allSessions = sessionsRes.data.data || [];
      const notifs = [];
      const today = new Date();

      // 1. Pending Swap Requests
      const pendingSwaps = swaps.filter(s => s.status === 'pending');
      
      pendingSwaps.forEach(swap => {
        const isRequester = swap.requester._id?.toString() === userId?.toString() || 
                            swap.requester?.toString() === userId?.toString();
        
        if (isRequester) {
          const receiver = swap.receiver;
          notifs.push({
            id: `waiting-${swap._id}`,
            type: 'waiting',
            icon: FaClock,
            title: 'Waiting for Response',
            message: `${receiver.firstName} ${receiver.lastName} has not accepted your request yet`,
            time: swap.createdAt,
            action: () => navigate('/connections'),
            badge: 'Pending',
          });
        } else {
          const requester = swap.requester;
          const skill = swap.skillExchange.requesterOffering;
          notifs.push({
            id: `request-${swap._id}`,
            type: 'request',
            icon: FaHandshake,
            title: 'New Swap Request',
            message: `${requester.firstName} ${requester.lastName} wants to learn ${skill.skillName} from you`,
            time: swap.createdAt,
            action: () => navigate('/connections'),
            badge: 'New',
          });
        }
      });

      // 2. New Sessions Created (last 7 days)
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      allSessions
        .filter(s => {
          const createdDate = new Date(s.createdAt);
          return createdDate >= sevenDaysAgo && s.status === 'scheduled';
        })
        .forEach(session => {
          const isTeacher = session.teacher?._id?.toString() === userId?.toString();
          const partner = isTeacher ? session.learner : session.teacher;
          
          if (partner) {
            notifs.push({
              id: `new-session-${session._id}`,
              type: 'new_session',
              icon: FaCalendarAlt,
              title: isTeacher ? 'New Teaching Session' : 'New Learning Session',
              message: `${isTeacher ? 'You scheduled a' : partner.firstName + ' scheduled a'} session on ${new Date(session.scheduledDate).toLocaleDateString()}`,
              time: session.createdAt,
              action: () => navigate(isTeacher ? '/teaching' : '/learning'),
              badge: 'New',
            });
          }
        });

      // 3. Upcoming Sessions (Next 7 days)
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      allSessions
        .filter(s => {
          const sessionDate = new Date(s.scheduledDate);
          return s.status === 'scheduled' && sessionDate >= today && sessionDate <= nextWeek;
        })
        .forEach(session => {
          const isTeacher = session.teacher?._id?.toString() === userId?.toString();
          const partner = isTeacher ? session.learner : session.teacher;
          
          if (partner) {
            const daysUntil = Math.ceil((new Date(session.scheduledDate) - today) / (1000 * 60 * 60 * 24));
            const dayText = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
            
            notifs.push({
              id: `upcoming-${session._id}`,
              type: 'upcoming',
              icon: FaClock,
              title: 'Upcoming Session',
              message: `${isTeacher ? 'Teaching' : 'Learning'} session with ${partner.firstName} ${partner.lastName} ${dayText}`,
              time: session.scheduledDate,
              action: () => navigate(isTeacher ? '/teaching' : '/learning'),
            });
          }
        });

      // 4. Active Swaps Progress
      const activeSwaps = swaps.filter(s => s.status === 'accepted' || s.status === 'active');
      
      activeSwaps.forEach(swap => {
        const isRequester = swap.requester._id?.toString() === userId?.toString();
        const partner = isRequester ? swap.receiver : swap.requester;
        
        const swapSessions = allSessions.filter(s => 
          s.swap === swap._id || s.swap?._id === swap._id
        );
        
        const completedSessions = swapSessions.filter(s => s.status === 'completed');
        const totalSessions = swapSessions.length;
        const progressPercent = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0;

        if (totalSessions === 0) {
          notifs.push({
            id: `no-sessions-${swap._id}`,
            type: 'action',
            icon: FaGraduationCap,
            title: 'Get Started',
            message: `Schedule your first session with ${partner.firstName} ${partner.lastName}`,
            time: swap.acceptedAt || swap.createdAt,
            action: () => navigate('/teaching'),
            badge: 'Action',
            progress: 0,
          });
        } else if (progressPercent === 50) {
          notifs.push({
            id: `progress-50-${swap._id}`,
            type: 'progress',
            icon: FaTrophy,
            title: 'Progress Update',
            message: `You are 50% complete with ${partner.firstName} ${partner.lastName}`,
            time: new Date(),
            progress: 50,
          });
        } else if (progressPercent >= 75 && progressPercent < 100) {
          notifs.push({
            id: `progress-75-${swap._id}`,
            type: 'progress',
            icon: FaTrophy,
            title: 'Almost Complete',
            message: `Only ${totalSessions - completedSessions.length} sessions remaining with ${partner.firstName} ${partner.lastName}`,
            time: new Date(),
            progress: progressPercent,
          });
        } else if (progressPercent === 100) {
          notifs.push({
            id: `complete-${swap._id}`,
            type: 'completed',
            icon: FaCheckCircle,
            title: 'Swap Completed',
            message: `You have completed all sessions with ${partner.firstName} ${partner.lastName}`,
            time: new Date(),
          });
        }
      });

      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <NavBar>
        <Center h="80vh">
          <Spinner size="xl" color="gray.500" />
        </Center>
      </NavBar>
    );
  }

  return (
    <NavBar>
      <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 8 }}>
        <Container maxW="container.lg">
          
          <HStack spacing={3} mb={6}>
            <Icon as={FaBell} boxSize={8} color="gray.700" />
            <Heading size={{ base: 'lg', md: 'xl' }}>Notifications</Heading>
            {notifications.length > 0 && (
              <Badge fontSize="md" px={2} py={1}>{notifications.length}</Badge>
            )}
          </HStack>

          <VStack spacing={3} align="stretch">
            {notifications.length === 0 ? (
              <Center py={16}>
                <VStack spacing={3}>
                  <Icon as={FaBell} boxSize={16} color="gray.300" />
                  <Text fontSize="lg" color="gray.500">No notifications</Text>
                  <Text fontSize="sm" color="gray.400">You will be notified about updates here</Text>
                </VStack>
              </Center>
            ) : (
              notifications.map((notif) => (
                <Card
                  key={notif.id}
                  boxShadow="sm"
                  _hover={{ boxShadow: 'md', cursor: notif.action ? 'pointer' : 'default' }}
                  onClick={notif.action}
                  transition="all 0.2s"
                  bg="white"
                >
                  <CardBody>
                    <HStack spacing={4} align="start">
                      
                      <Box p={3} bg="gray.100" borderRadius="full">
                        <Icon as={notif.icon} boxSize={5} color="gray.700" />
                      </Box>

                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" width="full">
                          <Text fontWeight="bold" fontSize="md">{notif.title}</Text>
                          {notif.badge && (
                            <Badge fontSize="xs">{notif.badge}</Badge>
                          )}
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.600">{notif.message}</Text>
                        
                        {notif.progress !== undefined && (
                          <Box width="full" mt={2}>
                            <Progress
                              value={notif.progress}
                              size="sm"
                              borderRadius="full"
                              bg="gray.200"
                              sx={{ '& > div': { backgroundColor: 'gray.700' } }}
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {notif.progress}% complete
                            </Text>
                          </Box>
                        )}
                        
                        <Text fontSize="xs" color="gray.400">
                          {getTimeAgo(notif.time)}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))
            )}
          </VStack>
        </Container>
      </Box>
    </NavBar>
  );
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return new Date(date).toLocaleDateString();
};

export default NotificationsPage;
