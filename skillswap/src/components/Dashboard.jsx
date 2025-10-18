import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import NavBar from './NavBar';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  Spinner,
  useToast,
  Center,
  Flex,
  Progress,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import {
  FiBook,
  FiClock,
  FiChevronRight,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiActivity,
  FiTarget
} from 'react-icons/fi';

function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [selectedDateSessions, setSelectedDateSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good evening');
    } else {
      setGreeting('Good night');
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        let userId = null;
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          userId = parsed._id || parsed.id || parsed.userId;
          setUser(parsed);
        }

        if (userId) {
          setCurrentUserId(userId);
          await fetchAllData(userId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
      }
    };
    initializePage();
    getGreeting();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('token');

      const sessionsRes = await axios.get('http://localhost:5000/api/sessions/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessionData = sessionsRes.data?.data || [];
      setSessions(Array.isArray(sessionData) ? sessionData : []);

      try {
        const swapsRes = await axios.get('http://localhost:5000/api/swaps', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const swapData = swapsRes.data?.data || [];
        setSwaps(Array.isArray(swapData) ? swapData : []);
      } catch (swapError) {
        console.error("Error fetching swaps:", swapError);
        setSwaps([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      toast({
        title: 'Error loading data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };



  useEffect(() => {
    const filtered = sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate.toDateString() === calendarValue.toDateString();
    });
    setSelectedDateSessions(filtered);
  }, [calendarValue, sessions]);

  const isTeacher = (session) => {
    if (!session.teacher || !currentUserId) return false;
    const teacherId = session.teacher._id || session.teacher;
    return teacherId.toString() === currentUserId.toString();
  };

  const isLearner = (session) => {
    if (!session.learner || !currentUserId) return false;
    const learnerId = session.learner._id || session.learner;
    return learnerId.toString() === currentUserId.toString();
  };

  const getUpcomingSessions = (sessionList) => {
    const now = new Date();
    return sessionList
      .filter(s => new Date(s.scheduledDate) >= now)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
      .slice(0, 5);
  };

  const teachingSessions = sessions.filter(isTeacher);
  const learningSessions = sessions.filter(isLearner);

  const upcomingTeaching = getUpcomingSessions(teachingSessions);
  const upcomingLearning = getUpcomingSessions(learningSessions);

  const getTeachingSkills = () => {
    const skillProgress = {};

    swaps.forEach(swap => {
      if (!swap.skillExchange || swap.status !== 'accepted') return;

      const isRequester = (swap.requester._id || swap.requester)?.toString() === currentUserId?.toString();

      // Get the skill being taught
      const skillOffering = isRequester
        ? swap.skillExchange.requesterOffering
        : swap.skillExchange.receiverOffering;

      const skillName = skillOffering?.skillName;
      if (!skillName) return;

      // Get total sessions from swap model
      const totalSessions = skillOffering?.totalSessions || 0;

      // Get completed sessions for this swap
      const swapSessions = sessions.filter(s =>
        s.swap && (s.swap._id === swap._id || s.swap === swap._id) && isTeacher(s)
      );
      const completedSessions = swapSessions.filter(s => s.status === 'completed').length;

      if (!skillProgress[skillName]) {
        skillProgress[skillName] = { total: 0, completed: 0 };
      }

      skillProgress[skillName].total += totalSessions;
      skillProgress[skillName].completed += completedSessions;
    });

    return Object.entries(skillProgress).map(([skill, data]) => ({
      skill,
      totalSessions: data.total,
      completedSessions: data.completed,
      completionPercentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  };

  // **UPDATED: Get learning skills with correct progress calculation**
  const getLearningSkills = () => {
    const skillProgress = {};

    swaps.forEach(swap => {
      if (!swap.skillExchange || swap.status !== 'accepted') return;

      const isRequester = (swap.requester._id || swap.requester)?.toString() === currentUserId?.toString();

      // Get the skill being learned (opposite of what you're teaching)
      const skillOffering = isRequester
        ? swap.skillExchange.receiverOffering
        : swap.skillExchange.requesterOffering;

      const skillName = skillOffering?.skillName;
      if (!skillName) return;

      // Get total sessions from swap model
      const totalSessions = skillOffering?.totalSessions || 0;

      // Get completed sessions for this swap where user is learner
      const swapSessions = sessions.filter(s =>
        s.swap && (s.swap._id === swap._id || s.swap === swap._id) && isLearner(s)
      );
      const completedSessions = swapSessions.filter(s => s.status === 'completed').length;

      if (!skillProgress[skillName]) {
        skillProgress[skillName] = { total: 0, completed: 0 };
      }

      skillProgress[skillName].total += totalSessions;
      skillProgress[skillName].completed += completedSessions;
    });

    return Object.entries(skillProgress).map(([skill, data]) => ({
      skill,
      totalSessions: data.total,
      completedSessions: data.completed,
      completionPercentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  };


  const teachingSkills = getTeachingSkills();
  const learningSkills = getLearningSkills();

  const getRecentActivity = () => {
    return sessions
      .sort((a, b) => new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate))
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSessionClick = (session) => {
    if (isTeacher(session)) {
      navigate('/teaching');
    } else {
      navigate('/learning');
    }
  };

  if (loading) {
    return (
      <NavBar>
        <Center h="calc(100vh - 80px)">
          <Spinner size="xl" color="gray.600" />
        </Center>
      </NavBar>
    );
  }

  return (
    <NavBar>
      <Box bg="gray.50" minH="calc(100vh - 80px)">
        <Container maxW="container.xl" py={8}>
          <Box mb={6}>
            <Heading size="lg" fontWeight="600" color="gray.800" mb={1}>
              {greeting}, {user?.firstName || 'User'}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Here's your learning activity overview
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap={6} mb={6}>
            <GridItem>
              <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <CardHeader pb={3}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading size="sm" fontWeight="600" color="gray.800">Calendar</Heading>
                      <Text color="gray.500" fontSize="xs" mt={1}>
                        {sessions.length} total session{sessions.length !== 1 ? 's' : ''}
                      </Text>
                    </Box>
                    <Icon as={FiCalendar} color="gray.400" boxSize={5} />
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <style>
                    {`
                      .minimal-calendar {
                        width: 100%;
                        border: none;
                        font-family: inherit;
                        background: transparent;
                        max-height: 380px;
                      }
                      .minimal-calendar .react-calendar__navigation {
                        display: flex;
                        align-items: center;
                        margin-bottom: 1rem;
                        height: 36px;
                      }
                      .minimal-calendar .react-calendar__navigation button {
                        min-width: 36px;
                        background: transparent;
                        font-size: 14px;
                        font-weight: 600;
                        color: #1A202C;
                        border: none;
                        border-radius: 6px;
                        transition: all 0.15s;
                      }
                      .minimal-calendar .react-calendar__navigation button:hover {
                        background: #F7FAFC;
                      }
                      .minimal-calendar .react-calendar__navigation button:disabled {
                        opacity: 0.3;
                      }
                      .minimal-calendar .react-calendar__navigation__label {
                        flex-grow: 1;
                        font-weight: 600;
                        font-size: 15px;
                        color: #1A202C;
                        pointer-events: none;
                      }
                      .minimal-calendar .react-calendar__navigation__arrow {
                        font-size: 18px;
                        color: #4A5568;
                      }
                      .minimal-calendar .react-calendar__month-view__weekdays {
                        text-align: center;
                        text-transform: uppercase;
                        font-weight: 500;
                        font-size: 11px;
                        color: #A0AEC0;
                        margin-bottom: 0.5rem;
                      }
                      .minimal-calendar .react-calendar__month-view__weekdays__weekday {
                        padding: 0.5rem;
                      }
                      .minimal-calendar .react-calendar__month-view__weekdays__weekday abbr {
                        text-decoration: none;
                      }
                      .minimal-calendar .react-calendar__month-view__days {
                        display: grid !important;
                        grid-template-columns: repeat(7, 1fr) !important;
                        gap: 2px;
                      }
                      .minimal-calendar .react-calendar__tile {
                        max-width: 100%;
                        height: 42px;
                        background: transparent;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 400;
                        color: #2D3748;
                        position: relative;
                        transition: all 0.15s;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                      .minimal-calendar .react-calendar__tile:hover {
                        background: #F7FAFC;
                      }
                      .minimal-calendar .react-calendar__tile--active {
                        background: #2D3748 !important;
                        color: white !important;
                        font-weight: 500;
                      }
                      .minimal-calendar .react-calendar__tile--active:hover {
                        background: #1A202C !important;
                      }
                      .minimal-calendar .react-calendar__tile--now {
                        background: #EDF2F7;
                        color: #2D3748;
                        font-weight: 500;
                      }
                      .minimal-calendar .react-calendar__tile--now:hover {
                        background: #E2E8F0;
                      }
                      .minimal-calendar .react-calendar__tile--neighboringMonth {
                        color: #CBD5E0;
                      }
                      .minimal-calendar .react-calendar__tile--hasTeaching::after {
                        content: '';
                        position: absolute;
                        bottom: 6px;
                        left: calc(50% - 5px);
                        width: 4px;
                        height: 4px;
                        background: #48BB78;
                        border-radius: 50%;
                      }
                      .minimal-calendar .react-calendar__tile--hasLearning::before {
                        content: '';
                        position: absolute;
                        bottom: 6px;
                        left: calc(50% + 1px);
                        width: 4px;
                        height: 4px;
                        background: #4299E1;
                        border-radius: 50%;
                      }
                      .minimal-calendar .react-calendar__tile--hasTeaching.react-calendar__tile--hasLearning::after {
                        left: calc(50% - 5px);
                      }
                      .minimal-calendar .react-calendar__tile--hasTeaching.react-calendar__tile--hasLearning::before {
                        left: calc(50% + 1px);
                      }
                      .minimal-calendar .react-calendar__tile--active.react-calendar__tile--hasTeaching::after {
                        background: white;
                      }
                      .minimal-calendar .react-calendar__tile--active.react-calendar__tile--hasLearning::before {
                        background: white;
                      }
                    `}
                  </style>
                  <Calendar
                    className="minimal-calendar"
                    onChange={setCalendarValue}
                    value={calendarValue}
                    locale="en-US"
                    calendarType="gregory"
                    showNeighboringMonth={true}
                    formatShortWeekday={(locale, date) => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return days[date.getDay()];
                    }}
                    tileClassName={({ date, view }) => {
                      if (view === 'month') {
                        const dateStr = date.toDateString();
                        const hasTeaching = sessions.some(s => {
                          const sessionDate = new Date(s.scheduledDate);
                          return sessionDate.toDateString() === dateStr && isTeacher(s);
                        });
                        const hasLearning = sessions.some(s => {
                          const sessionDate = new Date(s.scheduledDate);
                          return sessionDate.toDateString() === dateStr && isLearner(s);
                        });
                        const classes = [];
                        if (hasTeaching) classes.push('react-calendar__tile--hasTeaching');
                        if (hasLearning) classes.push('react-calendar__tile--hasLearning');
                        return classes.join(' ');
                      }
                    }}
                  />
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="gray.200" h="full">
                <CardHeader pb={3}>
                  <Heading size="sm" fontWeight="600" color="gray.800">{formatDate(calendarValue)}</Heading>
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    {selectedDateSessions.length} session{selectedDateSessions.length !== 1 ? 's' : ''}
                  </Text>
                </CardHeader>
                <CardBody pt={0} maxH="420px" overflowY="auto">
                  {selectedDateSessions.length === 0 ? (
                    <Center h="150px">
                      <VStack spacing={2}>
                        <Icon as={FiCalendar} color="gray.300" boxSize={8} />
                        <Text color="gray.400" fontSize="sm">No sessions</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {selectedDateSessions.map(session => (
                        <Box
                          key={session._id}
                          p={4}
                          border="1px solid"
                          borderColor={isTeacher(session) ? "green.200" : "blue.200"}
                          borderRadius="lg"
                          bg="white"
                          cursor="pointer"
                          _hover={{
                            borderColor: isTeacher(session) ? "green.500" : "blue.500",
                            shadow: 'sm',
                            bg: isTeacher(session) ? "green.50" : "blue.50"
                          }}
                          transition="all 0.2s"
                          onClick={() => handleSessionClick(session)}
                        >
                          <Flex justify="space-between" align="start" mb={2}>
                            <Text fontWeight="600" fontSize="sm" color="gray.800">{session.title}</Text>
                            <Icon as={FiChevronRight} color="gray.400" boxSize={4} />
                          </Flex>
                          <HStack spacing={3} fontSize="xs" color="gray.500" mb={2}>
                            <HStack spacing={1}>
                              <Icon as={FiClock} boxSize={3} />
                              <Text>{formatTime(session.startTime)}</Text>
                            </HStack>
                            <Text>•</Text>
                            <Text>{session.format}</Text>
                          </HStack>
                          <Badge
                            size="sm"
                            bg={isTeacher(session) ? 'green.100' : 'blue.100'}
                            color={isTeacher(session) ? 'green.700' : 'blue.700'}
                            fontSize="10px"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {isTeacher(session) ? 'Teaching' : 'Learning'}
                          </Badge>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="green.200">
              <CardHeader pb={3} borderBottom="1px solid" borderColor="green.100">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm" fontWeight="600" color="green.700">Teaching Skills</Heading>
                    <Text color="gray.500" fontSize="xs" mt={1}>{teachingSkills.length} active skill{teachingSkills.length !== 1 ? 's' : ''}</Text>
                  </Box>
                  <Icon as={FiTarget} color="green.500" boxSize={4} />
                </Flex>
              </CardHeader>
              <CardBody pt={3}>
                {teachingSkills.length === 0 ? (
                  <Center py={6}>
                    <Text color="gray.400" fontSize="sm">No teaching skills yet</Text>
                  </Center>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {teachingSkills.map((skillData) => (
                      <Box key={skillData.skill}>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Box flex="1">
                            <Text fontSize="sm" fontWeight="600" color="green.800" mb={1}>
                              {skillData.skill}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {skillData.completedSessions}/{skillData.totalSessions} sessions completed
                            </Text>
                          </Box>
                          <CircularProgress
                            value={skillData.completionPercentage}
                            size="50px"
                            color="green.500"
                            trackColor="green.100"
                            thickness="8px"
                          >
                            <CircularProgressLabel fontSize="xs" fontWeight="600" color="green.700">
                              {skillData.completionPercentage}%
                            </CircularProgressLabel>
                          </CircularProgress>
                        </Flex>
                        <Progress value={skillData.completionPercentage} size="xs" colorScheme="green" borderRadius="full" bg="green.50" />
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="blue.200">
              <CardHeader pb={3} borderBottom="1px solid" borderColor="blue.100">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm" fontWeight="600" color="blue.700">Learning Skills</Heading>
                    <Text color="gray.500" fontSize="xs" mt={1}>{learningSkills.length} active skill{learningSkills.length !== 1 ? 's' : ''}</Text>
                  </Box>
                  <Icon as={FiTarget} color="blue.500" boxSize={4} />
                </Flex>
              </CardHeader>
              <CardBody pt={3}>
                {learningSkills.length === 0 ? (
                  <Center py={6}>
                    <Text color="gray.400" fontSize="sm">No learning skills yet</Text>
                  </Center>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {learningSkills.map((skillData) => (
                      <Box key={skillData.skill}>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Box flex="1">
                            <Text fontSize="sm" fontWeight="600" color="blue.800" mb={1}>
                              {skillData.skill}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {skillData.completedSessions}/{skillData.totalSessions} sessions completed
                            </Text>
                          </Box>
                          <CircularProgress
                            value={skillData.completionPercentage}
                            size="50px"
                            color="blue.500"
                            trackColor="blue.100"
                            thickness="8px"
                          >
                            <CircularProgressLabel fontSize="xs" fontWeight="600" color="blue.700">
                              {skillData.completionPercentage}%
                            </CircularProgressLabel>
                          </CircularProgress>
                        </Flex>
                        <Progress value={skillData.completionPercentage} size="xs" colorScheme="blue" borderRadius="full" bg="blue.50" />
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </Grid>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="green.200">
              <CardHeader pb={3} borderBottom="1px solid" borderColor="green.100">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm" fontWeight="600" color="green.700">Upcoming Teaching</Heading>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      Next {upcomingTeaching.length} session{upcomingTeaching.length !== 1 ? 's' : ''}
                    </Text>
                  </Box>
                  <Icon as={FiBook} color="green.500" boxSize={4} />
                </Flex>
              </CardHeader>
              <CardBody pt={3}>
                {upcomingTeaching.length === 0 ? (
                  <Center py={6}>
                    <Text color="gray.400" fontSize="sm">No upcoming sessions</Text>
                  </Center>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {upcomingTeaching.map((s) => (
                      <Box
                        key={s._id}
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="green.100"
                        bg="green.50"
                        cursor="pointer"
                        _hover={{ bg: 'green.100', borderColor: 'green.300', transform: 'translateY(-1px)', shadow: 'sm' }}
                        transition="all 0.15s"
                        onClick={() => navigate('/teaching')}
                      >
                        <Flex justify="space-between" align="start" mb={2}>
                          <Text fontWeight="600" fontSize="sm" color="green.800">{s.title}</Text>
                          <Icon as={FiChevronRight} color="green.400" boxSize={3.5} />
                        </Flex>
                        <HStack spacing={3} fontSize="xs" color="green.700">
                          <Text>{formatDateShort(s.scheduledDate)}</Text>
                          <Text>•</Text>
                          <Text>{formatTime(s.startTime)}</Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="blue.200">
              <CardHeader pb={3} borderBottom="1px solid" borderColor="blue.100">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm" fontWeight="600" color="blue.700">Upcoming Learning</Heading>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      Next {upcomingLearning.length} session{upcomingLearning.length !== 1 ? 's' : ''}
                    </Text>
                  </Box>
                  <Icon as={FiBook} color="blue.500" boxSize={4} />
                </Flex>
              </CardHeader>
              <CardBody pt={3}>
                {upcomingLearning.length === 0 ? (
                  <Center py={6}>
                    <Text color="gray.400" fontSize="sm">No upcoming sessions</Text>
                  </Center>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {upcomingLearning.map((s) => (
                      <Box
                        key={s._id}
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="blue.100"
                        bg="blue.50"
                        cursor="pointer"
                        _hover={{ bg: 'blue.100', borderColor: 'blue.300', transform: 'translateY(-1px)', shadow: 'sm' }}
                        transition="all 0.15s"
                        onClick={() => navigate('/learning')}
                      >
                        <Flex justify="space-between" align="start" mb={2}>
                          <Text fontWeight="600" fontSize="sm" color="blue.800">{s.title}</Text>
                          <Icon as={FiChevronRight} color="blue.400" boxSize={3.5} />
                        </Flex>
                        <HStack spacing={3} fontSize="xs" color="blue.700">
                          <Text>{formatDateShort(s.scheduledDate)}</Text>
                          <Text>•</Text>
                          <Text>{formatTime(s.startTime)}</Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </Grid>

          <Card bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="gray.200">
            <CardHeader pb={3}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="sm" fontWeight="600" color="gray.800">Recent Activity</Heading>
                  <Text color="gray.500" fontSize="xs" mt={1}>Latest session updates</Text>
                </Box>
                <Icon as={FiActivity} color="gray.400" boxSize={4} />
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              {recentActivity.length === 0 ? (
                <Center py={6}>
                  <Text color="gray.400" fontSize="sm">No recent activity</Text>
                </Center>
              ) : (
                <VStack spacing={3} align="stretch">
                  {recentActivity.map((session, index) => (
                    <React.Fragment key={session._id}>
                      <Flex
                        justify="space-between"
                        align="center"
                        cursor="pointer"
                        _hover={{ bg: 'gray.50' }}
                        p={2}
                        borderRadius="md"
                        transition="all 0.15s"
                        onClick={() => handleSessionClick(session)}
                      >
                        <HStack spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={isTeacher(session) ? 'green.500' : 'blue.500'} />
                          <Box>
                            <Text fontSize="sm" fontWeight="500" color="gray.800">{session.title}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatDateShort(session.scheduledDate)} at {formatTime(session.startTime)}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge
                          colorScheme={session.status === 'completed' ? 'green' : session.status === 'cancelled' ? 'red' : 'gray'}
                          fontSize="xs"
                        >
                          {session.status}
                        </Badge>
                      </Flex>
                      {index < recentActivity.length - 1 && <Box h="1px" bg="gray.100" />}
                    </React.Fragment>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </Container>
      </Box>
    </NavBar>
  );
}

export default Dashboard;
