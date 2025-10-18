// src/pages/SwapDetail/SwapDetailPage.jsx
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    GridItem,
    Heading,
    Text,
    VStack,
    HStack,
    Avatar,
    Badge,
    Button,
    Icon,
    Divider,
    Card,
    CardBody,
    Spinner,
    Center,
    useToast,
    Flex,
    IconButton,
    Textarea,
    FormControl,
    FormLabel,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Select,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Input,
} from '@chakra-ui/react';
import {
    FaArrowLeft,
    FaCalendar,
    FaClock,
    FaGraduationCap,
    FaPaperPlane,
    FaPlus,
    FaEdit,
    FaTrash,
    FaExchangeAlt,
} from 'react-icons/fa';
import axios from 'axios';
import NavBar from './NavBar';

function SwapDetailPage() {
    const { swapId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [swap, setSwap] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);

    const { isOpen: isSessionModalOpen, onOpen: onSessionModalOpen, onClose: onSessionModalClose } = useDisclosure();

    useEffect(() => {
        fetchSwapDetails();
    }, [swapId]);

    const fetchSwapDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            const response = await axios.get(`http://localhost:5000/api/swaps/${swapId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const swapData = response.data.data;
            setSwap(swapData);
            setSessions(swapData.sessions || []);
            setMessages(swapData.messages || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching swap:', error);
            toast({
                title: 'Error',
                description: 'Failed to load swap details',
                status: 'error',
                duration: 3000,
            });
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            setSendingMessage(true);
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            await axios.post(
                `http://localhost:5000/api/swaps/${swapId}/messages`,
                { content: newMessage },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setNewMessage('');
            fetchSwapDetails();
            setSendingMessage(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send message',
                status: 'error',
                duration: 3000,
            });
            setSendingMessage(false);
        }
    };

    if (loading) {
        return (
            <NavBar>
                <Center h="80vh">
                    <Spinner size="xl" color="blue.500" />
                </Center>
            </NavBar>
        );
    }

    if (!swap) {
        return (
            <NavBar>
                <Center h="80vh">
                    <Text>Swap not found</Text>
                </Center>
            </NavBar>
        );
    }

    // ✅ FIX: Safely get current user ID
    const getCurrentUserId = () => {
        try {
            const userStr = localStorage.getItem('user') || localStorage.getItem('accessToken');
            if (!userStr) return null;

            const user = JSON.parse(userStr);
            return user._id || user.id || user.userId;
        } catch (error) {
            console.error('Error parsing user:', error);
            return null;
        }
    };

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
        return (
            <NavBar>
                <Center h="80vh">
                    <VStack>
                        <Text>Unable to identify user</Text>
                        <Button onClick={() => navigate('/signin')}>Go to Login</Button>
                    </VStack>
                </Center>
            </NavBar>
        );
    }

    // ✅ FIX: Properly identify which user we are
    const isRequester = swap.requester._id
        ? swap.requester._id.toString() === currentUserId.toString()
        : swap.requester.toString() === currentUserId.toString();

    const otherUser = isRequester ? swap.receiver : swap.requester;
    const mySkill = isRequester ? swap.skillExchange.requesterOffering : swap.skillExchange.receiverOffering;
    const theirSkill = isRequester ? swap.skillExchange.receiverOffering : swap.skillExchange.requesterOffering;

    // ✅ FIX: Separate sessions properly with null checks
    const teachingSessions = sessions.filter(s => {
        if (!s.teacher) return false;
        const teacherId = s.teacher._id ? s.teacher._id.toString() : s.teacher.toString();
        return teacherId === currentUserId.toString();
    });

    const learningSessions = sessions.filter(s => {
        if (!s.learner) return false;
        const learnerId = s.learner._id ? s.learner._id.toString() : s.learner.toString();
        return learnerId === currentUserId.toString();
    });

    return (
        <NavBar>
            <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 6 }}>
                <Container maxW="container.2xl">

                    {/* Header */}
                    <HStack mb={6} spacing={4}>
                        <IconButton
                            icon={<FaArrowLeft />}
                            onClick={() => navigate('/connections')}
                            variant="ghost"
                            aria-label="Back"
                        />
                        <Heading size={{ base: 'md', md: 'lg' }}>Swap with {otherUser.firstName}</Heading>
                        <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                            {swap.status}
                        </Badge>
                    </HStack>

                    {/* Main Grid Layout */}
                    <Grid
                        templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                        gap={6}
                    >
                        {/* Left Side - Sessions */}
                        <GridItem>
                            <VStack spacing={6} align="stretch">

                                {/* User Info Card with Skills */}
                                <Card boxShadow="md">
                                    <CardBody>
                                        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                                            {/* User Info */}
                                            <HStack spacing={4} flex={1}>
                                                <Avatar
                                                    size="lg"
                                                    name={`${otherUser.firstName} ${otherUser.lastName}`}
                                                    src={otherUser.avatar}
                                                />
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="lg">
                                                        {otherUser.firstName} {otherUser.lastName}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">{otherUser.email}</Text>
                                                    <Button size="xs" variant="link" colorScheme="blue">
                                                        View Profile
                                                    </Button>
                                                </VStack>
                                            </HStack>

                                            <Divider orientation={{ base: 'horizontal', md: 'vertical' }} />

                                            {/* Skill Exchange Info */}
                                            <VStack align="start" spacing={2} flex={1}>
                                                <HStack spacing={2}>
                                                    <Icon as={FaExchangeAlt} color="blue.500" />
                                                    <Text fontSize="sm" fontWeight="bold">Skill Exchange</Text>
                                                </HStack>

                                                <HStack spacing={2} fontSize="sm">
                                                    <Badge colorScheme="green" px={2} py={1}>Teaching: {mySkill.skillName}</Badge>
                                                </HStack>

                                                <HStack spacing={2} fontSize="sm">
                                                    <Badge colorScheme="blue" px={2} py={1}>Learning: {theirSkill.skillName}</Badge>
                                                </HStack>
                                            </VStack>
                                        </Flex>
                                    </CardBody>
                                </Card>

                                {/* Sessions with Tabs */}
                                <Card boxShadow="md">
                                    <CardBody p={0}>
                                        <Tabs colorScheme="blue" variant="enclosed">
                                            <TabList>
                                                <Tab>
                                                    <HStack>
                                                        <Icon as={FaGraduationCap} color="green.500" />
                                                        <Text>Teaching Sessions ({teachingSessions.length})</Text>
                                                    </HStack>
                                                </Tab>
                                                <Tab>
                                                    <HStack>
                                                        <Icon as={FaGraduationCap} color="blue.500" />
                                                        <Text>Learning Sessions ({learningSessions.length})</Text>
                                                    </HStack>
                                                </Tab>
                                            </TabList>

                                            <TabPanels>
                                                {/* Teaching Sessions Tab */}
                                                <TabPanel>
                                                    <VStack spacing={4} align="stretch">
                                                        <Flex justify="space-between" align="center">
                                                            <Text fontSize="sm" color="gray.600">
                                                                Sessions where you teach <strong>{otherUser.firstName}</strong> {mySkill.skillName}
                                                            </Text>
                                                            <Button
                                                                leftIcon={<FaPlus />}
                                                                colorScheme="green"
                                                                size="sm"
                                                                onClick={onSessionModalOpen}
                                                            >
                                                                Add Session
                                                            </Button>
                                                        </Flex>

                                                        {teachingSessions.length === 0 ? (
                                                            <Center py={8}>
                                                                <VStack>
                                                                    <Icon as={FaCalendar} boxSize={12} color="gray.300" />
                                                                    <Text color="gray.500">No teaching sessions yet</Text>
                                                                    <Text fontSize="sm" color="gray.400">Click "Add Session" to schedule your first class</Text>
                                                                </VStack>
                                                            </Center>
                                                        ) : (
                                                            <VStack spacing={3} align="stretch">
                                                                {teachingSessions.map((session) => (
                                                                    <SessionCard
                                                                        key={session._id}
                                                                        session={session}
                                                                        canEdit={true}
                                                                        type="teaching"
                                                                        otherUser={otherUser}
                                                                        onRefresh={fetchSwapDetails}
                                                                    />
                                                                ))}
                                                            </VStack>
                                                        )}
                                                    </VStack>
                                                </TabPanel>

                                                {/* Learning Sessions Tab */}
                                                <TabPanel>
                                                    <VStack spacing={4} align="stretch">
                                                        <Text fontSize="sm" color="gray.600">
                                                            Sessions where <strong>{otherUser.firstName}</strong> teaches you {theirSkill.skillName}
                                                        </Text>

                                                        {learningSessions.length === 0 ? (
                                                            <Center py={8}>
                                                                <VStack>
                                                                    <Icon as={FaCalendar} boxSize={12} color="gray.300" />
                                                                    <Text color="gray.500">No learning sessions yet</Text>
                                                                    <Text fontSize="sm" color="gray.400">
                                                                        Waiting for {otherUser.firstName} to schedule sessions
                                                                    </Text>
                                                                </VStack>
                                                            </Center>
                                                        ) : (
                                                            <VStack spacing={3} align="stretch">
                                                                {learningSessions.map((session) => (
                                                                    <SessionCard
                                                                        key={session._id}
                                                                        session={session}
                                                                        canEdit={false}
                                                                        type="learning"
                                                                        otherUser={otherUser}
                                                                        onRefresh={fetchSwapDetails}
                                                                    />
                                                                ))}
                                                            </VStack>
                                                        )}
                                                    </VStack>
                                                </TabPanel>
                                            </TabPanels>
                                        </Tabs>
                                    </CardBody>
                                </Card>
                            </VStack>
                        </GridItem>

                        {/* Right Side - Chat */}
                        <GridItem>
                            <Card boxShadow="lg" height={{ base: '500px', lg: '85vh' }} position="sticky" top={4}>
                                <CardBody p={0} display="flex" flexDirection="column" height="100%">
                                    {/* Chat Header */}
                                    <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                                        <HStack>
                                            <Avatar size="sm" name={`${otherUser.firstName} ${otherUser.lastName}`} src={otherUser.avatar} />
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="bold" fontSize="sm">
                                                    {otherUser.firstName} {otherUser.lastName}
                                                </Text>
                                                <Text fontSize="xs" color="green.500">● Online</Text>
                                            </VStack>
                                        </HStack>
                                    </Box>

                                    {/* Messages Area */}
                                    <Box flex={1} overflowY="auto" p={4}>
                                        <VStack spacing={3} align="stretch">
                                            {messages.length === 0 ? (
                                                <Center h="full">
                                                    <Text color="gray.400" fontSize="sm">No messages yet. Start the conversation!</Text>
                                                </Center>
                                            ) : (
                                                messages.map((msg, idx) => (
                                                    <MessageBubble
                                                        key={idx}
                                                        message={msg}
                                                        isMine={msg.sender?._id === currentUserId}
                                                    />
                                                ))
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Message Input */}
                                    <Box p={4} borderTop="1px solid" borderColor="gray.200">
                                        <HStack>
                                            <Textarea
                                                placeholder="Type your message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                size="sm"
                                                resize="none"
                                                rows={2}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            />
                                            <IconButton
                                                icon={<FaPaperPlane />}
                                                colorScheme="blue"
                                                onClick={handleSendMessage}
                                                isLoading={sendingMessage}
                                                aria-label="Send"
                                            />
                                        </HStack>
                                    </Box>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </Container>
            </Box>

            {/* Create Session Modal */}
            <CreateSessionModal
                isOpen={isSessionModalOpen}
                onClose={onSessionModalClose}
                swapId={swapId}
                onSuccess={fetchSwapDetails}
                otherUser={otherUser}
            />
        </NavBar>
    );
}

// Session Card Component
const SessionCard = ({ session, canEdit, type, otherUser, onRefresh }) => {
    const toast = useToast();

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            await axios.delete(`http://localhost:5000/api/sessions/${session._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast({
                title: 'Session Deleted',
                status: 'success',
                duration: 3000,
            });

            onRefresh();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete session',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const statusColors = {
        scheduled: 'blue',
        completed: 'green',
        cancelled: 'red',
    };

    return (
        <Box
            p={4}
            bg={type === 'teaching' ? 'green.50' : 'blue.50'}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor={type === 'teaching' ? 'green.400' : 'blue.400'}
        >
            <Flex justify="space-between" align="start">
                <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" fontSize="md">{session.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                        with {otherUser.firstName} {otherUser.lastName}
                    </Text>
                    <HStack fontSize="sm" color="gray.600" spacing={4}>
                        <HStack>
                            <Icon as={FaCalendar} />
                            <Text>{new Date(session.scheduledDate).toLocaleDateString()}</Text>
                        </HStack>
                        <HStack>
                            <Icon as={FaClock} />
                            <Text>{session.startTime} - {session.endTime}</Text>
                        </HStack>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">{session.location || session.format}</Text>
                    <Badge colorScheme={statusColors[session.status]} fontSize="xs" mt={1}>
                        {session.status}
                    </Badge>
                </VStack>

                {canEdit && (
                    <HStack spacing={2}>
                        <IconButton
                            icon={<FaEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            aria-label="Edit"
                        />
                        <IconButton
                            icon={<FaTrash />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete"
                            onClick={handleDelete}
                        />
                    </HStack>
                )}
            </Flex>
        </Box>
    );
};

// Message Bubble Component
const MessageBubble = ({ message, isMine }) => (
    <Flex justify={isMine ? 'flex-end' : 'flex-start'}>
        <Box
            bg={isMine ? 'blue.500' : 'gray.200'}
            color={isMine ? 'white' : 'black'}
            px={4}
            py={2}
            borderRadius="lg"
            maxW="70%"
        >
            <Text fontSize="sm">{message.content}</Text>
            <Text fontSize="xs" opacity={0.7} mt={1}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </Box>
    </Flex>
);

// Create Session Modal
const CreateSessionModal = ({ isOpen, onClose, swapId, onSuccess, otherUser }) => {
    const [formData, setFormData] = useState({
        title: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        duration: 60,
        format: 'online',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            await axios.post(
                `http://localhost:5000/api/sessions`,
                { ...formData, swap: swapId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            toast({
                title: 'Session Created',
                status: 'success',
                duration: 3000,
            });

            onSuccess();
            onClose();
            setLoading(false);

            // Reset form
            setFormData({
                title: '',
                scheduledDate: '',
                startTime: '',
                endTime: '',
                duration: 60,
                format: 'online',
                location: '',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create session',
                status: 'error',
                duration: 3000,
            });
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Schedule Teaching Session</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Session Title</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={`Teaching ${otherUser.firstName}`}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Date</FormLabel>
                            <Input
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            />
                        </FormControl>

                        <HStack width="full">
                            <FormControl>
                                <FormLabel>Start Time</FormLabel>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>End Time</FormLabel>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </FormControl>
                        </HStack>

                        <FormControl>
                            <FormLabel>Format</FormLabel>
                            <Select
                                value={formData.format}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Meeting Link / Location</FormLabel>
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Zoom link or physical address"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        Create Session
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SwapDetailPage;
