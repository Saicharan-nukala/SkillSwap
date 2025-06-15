import React from 'react';
import NavBar from './NavBar';
import {
    Box,
    Container,
    Grid,
    GridItem,
    Text,
    VStack,
    HStack,
    Avatar,
    Badge,
    Progress,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Button,
    Icon,
    Flex,
    Circle,
    Divider,
    Tag,
    TagLabel,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useColorModeValue
} from '@chakra-ui/react';
import { FiBook, FiUsers, FiTrendingUp, FiCalendar, FiClock, FiStar, FiArrowRight, FiTarget, FiAward, FiMessageCircle } from 'react-icons/fi';

const Dashboard = () => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Mock data
    const todaysTasks = [
        { id: 1, title: 'React Hooks Session', time: '2:00 PM', type: 'teaching', student: 'Sarah Chen', avatar: 'https://bit.ly/sage-adebayo' },
        { id: 2, title: 'Python Fundamentals', time: '4:30 PM', type: 'learning', teacher: 'Alex Kumar', avatar: 'https://bit.ly/ryan-florence' },
        { id: 3, title: 'UI/UX Design Review', time: '6:00 PM', type: 'teaching', student: 'Maya Patel', avatar: 'https://bit.ly/prosper-baba' }
    ];

    const currentLearnings = [
        { skill: 'Python Programming', progress: 75, teacher: 'Alex Kumar', nextSession: 'Today 4:30 PM' },
        { skill: 'Digital Marketing', progress: 45, teacher: 'Lisa Wong', nextSession: 'Tomorrow 3:00 PM' },
        { skill: 'Data Visualization', progress: 20, teacher: 'John Smith', nextSession: 'Friday 2:00 PM' }
    ];

    const currentTeachings = [
        { skill: 'React Development', students: 3, avgRating: 4.8, nextSession: 'Today 2:00 PM' },
        { skill: 'JavaScript ES6+', students: 2, avgRating: 4.9, nextSession: 'Wednesday 5:00 PM' },
        { skill: 'Node.js Backend', students: 1, avgRating: 5.0, nextSession: 'Thursday 1:00 PM' }
    ];

    const recommendedSkills = [
        { name: 'TypeScript', match: 95, category: 'Programming', demand: 'High' },
        { name: 'GraphQL', match: 88, category: 'Backend', demand: 'Medium' },
        { name: 'Docker', match: 82, category: 'DevOps', demand: 'High' },
        { name: 'Figma', match: 75, category: 'Design', demand: 'Medium' }
    ];
    return (
        <NavBar>
            <Box bg={bgColor} minH="100vh" py={8}>
                <Container maxW="7xl">
                    {/* Header */}
                    <VStack spacing={6} align="stretch">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                                <Heading size="lg" color="blue.600">Good afternoon, Sai Charan!</Heading>
                                <Text color="gray.600">Ready to learn and teach today?</Text>
                            </VStack>
                        </Flex>

                        {/* Main Content Grid */}
                        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                            {/* Left Column */}
                            <GridItem>
                                <VStack spacing={6} align="stretch">
                                    {/* Today's Schedule */}
                                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                                        <CardHeader pb={2}>
                                            <HStack justify="space-between">
                                                <HStack>
                                                    <Icon as={FiCalendar} color="blue.500" />
                                                    <Heading size="md">Today's Schedule</Heading>
                                                </HStack>
                                                <Badge colorScheme="blue">{todaysTasks.length} sessions</Badge>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody pt={0}>
                                            <VStack spacing={3} align="stretch">
                                                {todaysTasks.map((task) => (
                                                    <Box key={task.id} p={3} bg='gray.50' borderRadius="md">
                                                        <HStack justify="space-between">
                                                            <HStack>
                                                                <Avatar size="sm" src={task.avatar} />
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="semibold" fontSize="sm">{task.title}</Text>
                                                                    <Text fontSize="xs" color="gray.600">
                                                                        {task.type === 'teaching' ? `Teaching ${task.student}` : `Learning from ${task.teacher}`}
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                            <VStack align="end" spacing={0}>
                                                                <Badge colorScheme={task.type === 'teaching' ? 'green' : 'blue'} size="sm">
                                                                    {task.type}
                                                                </Badge>
                                                                <Text fontSize="xs" color="gray.600">{task.time}</Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    {/* Learning Progress */}
                                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                                        <CardHeader pb={2}>
                                            <HStack>
                                                <Icon as={FiBook} color="green.500" />
                                                <Heading size="md">Current Learning</Heading>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody pt={0}>
                                            <VStack spacing={4} align="stretch">
                                                {currentLearnings.map((learning, index) => (
                                                    <Box key={index}>
                                                        <HStack justify="space-between" mb={2}>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="semibold">{learning.skill}</Text>
                                                                <Text fontSize="sm" color="gray.600">with {learning.teacher}</Text>
                                                            </VStack>
                                                            <Text fontSize="sm" fontWeight="bold" color="green.500">
                                                                {learning.progress}%
                                                            </Text>
                                                        </HStack>
                                                        <Progress value={learning.progress} colorScheme="green" size="sm" borderRadius="full" />
                                                        <Text fontSize="xs" color="gray.500" mt={1}>Next: {learning.nextSession}</Text>
                                                        {index < currentLearnings.length - 1 && <Divider mt={3} />}
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </VStack>
                            </GridItem>

                            {/* Right Column */}
                            <GridItem>
                                <VStack spacing={6} align="stretch">
                                    {/* Teaching Overview */}
                                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                                        <CardHeader pb={2}>
                                            <HStack>
                                                <Icon as={FiUsers} color="blue.500" />
                                                <Heading size="md">Teaching</Heading>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody pt={0}>
                                            <VStack spacing={3} align="stretch">
                                                {currentTeachings.map((teaching, index) => (
                                                    <Box key={index} p={3} bg='blue.5' borderRadius="md">
                                                        <VStack align="start" spacing={1}>
                                                            <HStack spacing={3}>
                                                                <Text fontWeight="semibold" fontSize="sm">{teaching.skill}</Text>
                                                                <HStack spacing={1}>
                                                                    <Icon as={FiStar} size="12px" color="yellow.500" />
                                                                    <Text fontSize="xs" color="gray.600">{teaching.avgRating}</Text>
                                                                </HStack>
                                                            </HStack>
                                                            <Text fontSize="xs" color="blue.600">Next: {teaching.nextSession}</Text>
                                                        </VStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    {/* Recommended Skills */}
                                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                                        <CardHeader pb={2}>
                                            <HStack justify="space-between">
                                                <HStack>
                                                    <Icon as={FiTrendingUp} color="orange.500" />
                                                    <Heading size="md">Recommended</Heading>
                                                </HStack>
                                                <Button size="sm" variant="ghost" rightIcon={<FiArrowRight />}>
                                                    View All
                                                </Button>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody pt={0}>
                                            <VStack spacing={3} align="stretch">
                                                {recommendedSkills.map((skill, index) => (
                                                    <Box key={index} p={3} border="1px" borderColor={borderColor} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                                                        <HStack justify="space-between" mb={2}>
                                                            <Text fontWeight="semibold" fontSize="sm">{skill.name}</Text>
                                                            <Badge colorScheme={skill.demand === 'High' ? 'red' : 'yellow'} size="sm">
                                                                {skill.demand}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Tag size="sm" colorScheme="gray">
                                                                <TagLabel>{skill.category}</TagLabel>
                                                            </Tag>
                                                            <Text fontSize="xs" color="green.500" fontWeight="semibold">
                                                                {skill.match}% match
                                                            </Text>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    {/* Quick Actions */}
                                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                                        <CardHeader pb={2}>
                                            <Heading size="md">Quick Actions</Heading>
                                        </CardHeader>
                                        <CardBody pt={0}>
                                            <VStack spacing={2}>
                                                <Button leftIcon={<FiMessageCircle />} variant="outline" size="sm" width="full">
                                                    Message Students
                                                </Button>
                                                <Button leftIcon={<FiTarget />} variant="outline" size="sm" width="full">
                                                    Find New Skills
                                                </Button>
                                                <Button leftIcon={<FiAward />} variant="outline" size="sm" width="full">
                                                    View Achievements
                                                </Button>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </VStack>
                            </GridItem>
                        </Grid>
                    </VStack>
                </Container>
            </Box>
        </NavBar>
    );
};

export default Dashboard;