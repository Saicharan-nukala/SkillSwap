'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Container, Card, CardBody, Heading, Text, VStack, HStack,
  Avatar, Badge, Icon, Spinner, Center, Button, IconButton, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  ModalFooter, FormControl, FormLabel, Input, Select, Textarea, useToast,
  Divider, Stack, Flex, useColorModeValue
} from '@chakra-ui/react';
import {
  FaCalendar, FaClock, FaMapMarkerAlt, FaEdit, FaCheckCircle, FaTimes,
  FaStar, FaRegStar, FaBook, FaArrowLeft, FaChalkboardTeacher, FaUserGraduate
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';

function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setCurrentUser] = useState(null);

  // Edit Modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editData, setEditData] = useState({});

  // Notes Modal
  const { isOpen: isNotesOpen, onOpen: onNotesOpen, onClose: onNotesClose } = useDisclosure();
  const [notes, setNotes] = useState('');

  // Rating Modal
  const { isOpen: isRatingOpen, onOpen: onRatingOpen, onClose: onRatingClose } = useDisclosure();
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Cancel Modal
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [cancelReason, setCancelReason] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchSessionDetails();
    fetchCurrentUser();
  }, [sessionId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://skill-swap-backend-h15b.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchSessionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://skill-swap-backend-h15b.onrender.com/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSession(response.data.data);
      setUserRole(response.data.userRole);
      setNotes(response.data.data.notes || '');
      setEditData({
        title: response.data.data.title,
        description: response.data.data.description,
        scheduledDate: response.data.data.scheduledDate?.split('T')[0],
        startTime: response.data.data.startTime,
        endTime: response.data.data.endTime,
        duration: response.data.data.duration,
        format: response.data.data.format,
        location: response.data.data.location
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch session details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://skill-swap-backend-h15b.onrender.com/api/sessions/${sessionId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Success',
        description: 'Session updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
      fetchSessionDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://skill-swap-backend-h15b.onrender.com/api/sessions/${sessionId}/notes`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast({
        title: 'Success',
        description: 'Notes updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onNotesClose();
      fetchSessionDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update notes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://skill-swap-backend-h15b.onrender.com/api/sessions/${sessionId}/rate`,
        { rating, feedback: ratingFeedback },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast({
        title: 'Success',
        description: 'Rating submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onRatingClose();
      setRating(0);
      setRatingFeedback('');
      fetchSessionDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit rating',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (status, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://skill-swap-backend-h15b.onrender.com/api/sessions/${sessionId}/status`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast({
        title: 'Success',
        description: `Session marked as ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (status === 'cancelled') {
        onCancelClose();
      }
      fetchSessionDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleConfirmAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://skill-swap-backend-h15b.onrender.com/api/sessions/${sessionId}/attendance`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast({
        title: 'Success',
        description: 'Attendance confirmed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchSessionDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm attendance',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'in-progress': return 'orange';
      default: return 'gray';
    }
  };

  const renderRatingStars = (currentRating, onRate = null) => {
    const themeColor = userRole === 'teacher' ? 'green.400' : 'blue.400';
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= currentRating ? FaStar : FaRegStar}
            color={star <= currentRating ? themeColor : 'gray.300'}
            boxSize={onRate ? 8 : 6}
            cursor={onRate ? 'pointer' : 'default'}
            onClick={() => onRate && onRate(star)}
            _hover={onRate ? { transform: 'scale(1.1)' } : {}}
            transition="all 0.2s"
          />
        ))}
      </HStack>
    );
  };

  if (loading) {
    return (
      <>
        <NavBar>
        <Center h="100vh">
          <Spinner size="xl" color={userRole === 'teacher' ? 'green.500' : 'blue.500'} />
        </Center>
        </NavBar>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <NavBar>
        <Container maxW="container.lg" py={8}>
          <Text>Session not found</Text>
        </Container>
        </NavBar>
      </>
    );
  }

  const isTeacher = userRole === 'teacher';
  const isLearner = userRole === 'learner';
  const otherUser = isTeacher ? session.learner : session.teacher;
  const canRate = session.status === 'completed';
  const hasRated = isTeacher 
    ? session.rating?.learnerRating?.rating 
    : session.rating?.teacherRating?.rating;
  const receivedRating = isTeacher
    ? session.rating?.teacherRating
    : session.rating?.learnerRating;

  // Theme colors based on role
  const themeColor = isTeacher ? 'green' : 'blue';
  const themeBg = isTeacher ? 'green.50' : 'blue.50';
  const iconColor = isTeacher ? 'green.500' : 'blue.500';

  return (
    <>
      <NavBar>
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.lg">
          {/* Back Button */}
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            mb={4}
            onClick={() => navigate(-1)}
            color={iconColor}
          >
            Back
          </Button>

          {/* Main Session Card */}
          <Card bg={cardBg} shadow="lg" mb={6} borderTop="4px" borderColor={iconColor}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                {/* Header Section */}
                <Flex justify="space-between" align="start">
                  <HStack spacing={4}>
                    <Box bg={themeBg} p={3} borderRadius="lg">
                      <Icon 
                        as={isTeacher ? FaChalkboardTeacher : FaUserGraduate} 
                        color={iconColor}
                        boxSize={8}
                      />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg">{session.title}</Heading>
                      <HStack>
                        <Badge colorScheme={themeColor} fontSize="sm" px={2}>
                          {isTeacher ? 'Teaching' : 'Learning'}
                        </Badge>
                        <Badge colorScheme={getStatusColor(session.status)} fontSize="sm" px={2}>
                          {session.status}
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                </Flex>

                <Divider />

                {/* Session Details */}
                <Stack spacing={4}>
                  <HStack>
                    <Icon as={FaCalendar} color={iconColor} boxSize={5} />
                    <Text fontWeight="semibold" minW="80px">Date:</Text>
                    <Text color="gray.600">{new Date(session.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                  </HStack>

                  <HStack>
                    <Icon as={FaClock} color={iconColor} boxSize={5} />
                    <Text fontWeight="semibold" minW="80px">Time:</Text>
                    <Text color="gray.600">{session.startTime} - {session.endTime} ({session.duration} mins)</Text>
                  </HStack>

                  <HStack>
                    <Icon as={FaMapMarkerAlt} color={iconColor} boxSize={5} />
                    <Text fontWeight="semibold" minW="80px">Format:</Text>
                    <Badge colorScheme="gray">{session.format}</Badge>
                    {session.location && <Text color="gray.600">{session.location}</Text>}
                  </HStack>

                  {session.description && (
                    <Box bg={themeBg} p={4} borderRadius="md">
                      <Text fontWeight="semibold" mb={2}>Description</Text>
                      <Text color="gray.700">{session.description}</Text>
                    </Box>
                  )}
                </Stack>

                <Divider />

                {/* Other Participant Info */}
                <Box bg={themeBg} p={4} borderRadius="md">
                  <Text fontWeight="semibold" mb={3} color={iconColor}>
                    {isTeacher ? 'Learner Information' : 'Teacher Information'}
                  </Text>
                  <HStack spacing={4}>
                    <Avatar name={otherUser.name} size="lg" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">{otherUser.name}</Text>
                      <Text fontSize="sm" color="gray.600">{otherUser.email}</Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Attendance Status */}
                {session.status === 'scheduled' && (
                  <Box>
                    <Text fontWeight="semibold" mb={3}>Attendance Status</Text>
                    <HStack spacing={3}>
                      <Badge 
                        colorScheme={session.attendance.teacherConfirmed ? 'green' : 'gray'} 
                        px={3} 
                        py={1}
                        fontSize="sm"
                      >
                        Teacher: {session.attendance.teacherConfirmed ? '✓ Confirmed' : 'Pending'}
                      </Badge>
                      <Badge 
                        colorScheme={session.attendance.learnerConfirmed ? 'green' : 'gray'} 
                        px={3} 
                        py={1}
                        fontSize="sm"
                      >
                        Learner: {session.attendance.learnerConfirmed ? '✓ Confirmed' : 'Pending'}
                      </Badge>
                    </HStack>
                  </Box>
                )}

                <Divider />

                {/* Action Buttons */}
                <Flex wrap="wrap" gap={3}>
                  {/* Teacher-Only Actions */}
                  {isTeacher && session.status === 'scheduled' && (
                    <>
                      <Button
                        leftIcon={<FaEdit />}
                        colorScheme={themeColor}
                        variant="outline"
                        onClick={onEditOpen}
                      >
                        Edit Session
                      </Button>
                      <Button
                        leftIcon={<FaCheckCircle />}
                        colorScheme="green"
                        onClick={() => handleStatusUpdate('completed')}
                      >
                        Mark Complete
                      </Button>
                      <Button
                        leftIcon={<FaTimes />}
                        colorScheme="red"
                        variant="outline"
                        onClick={onCancelOpen}
                      >
                        Cancel Session
                      </Button>
                    </>
                  )}

                  {/* Learner-Only Actions */}
                  {isLearner && session.status === 'scheduled' && !session.attendance.learnerConfirmed && (
                    <Button
                      leftIcon={<FaCheckCircle />}
                      colorScheme={themeColor}
                      onClick={handleConfirmAttendance}
                    >
                      Confirm Attendance
                    </Button>
                  )}

                  {/* Common Actions */}
                  <Button
                    leftIcon={<FaBook />}
                    colorScheme={themeColor}
                    variant="outline"
                    onClick={onNotesOpen}
                  >
                    {notes ? 'View/Edit Notes' : 'Add Notes'}
                  </Button>

                  {canRate && !hasRated && (
                    <Button
                      leftIcon={<FaStar />}
                      colorScheme={themeColor}
                      onClick={onRatingOpen}
                    >
                      Rate {isTeacher ? 'Learner' : 'Teacher'}
                    </Button>
                  )}
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Notes Section */}
          {notes && (
            <Card bg={cardBg} shadow="md" mb={6}>
              <CardBody>
                <HStack mb={4}>
                  <Icon as={FaBook} color={iconColor} boxSize={5} />
                  <Heading size="md">Notes & References</Heading>
                </HStack>
                <Box bg={themeBg} p={4} borderRadius="md">
                  <Text whiteSpace="pre-wrap" color="gray.700">{notes}</Text>
                </Box>
              </CardBody>
            </Card>
          )}

          {/* Ratings Section */}
          {(hasRated || receivedRating) && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Heading size="md" mb={6}>Session Ratings</Heading>
                <Stack spacing={6}>
                  {hasRated && (
                    <Box bg={themeBg} p={4} borderRadius="md">
                      <Text fontWeight="semibold" mb={3} color={iconColor}>
                        Your Rating for {isTeacher ? 'Learner' : 'Teacher'}
                      </Text>
                      {renderRatingStars(
                        isTeacher 
                          ? session.rating.learnerRating.rating 
                          : session.rating.teacherRating.rating
                      )}
                      {(isTeacher ? session.rating.learnerRating.feedback : session.rating.teacherRating.feedback) && (
                        <Text mt={3} color="gray.700" fontStyle="italic">
                          "{isTeacher ? session.rating.learnerRating.feedback : session.rating.teacherRating.feedback}"
                        </Text>
                      )}
                    </Box>
                  )}

                  {receivedRating?.rating && (
                    <Box bg="gray.50" p={4} borderRadius="md">
                      <Text fontWeight="semibold" mb={3}>
                        Rating from {isTeacher ? 'Learner' : 'Teacher'}
                      </Text>
                      {renderRatingStars(receivedRating.rating)}
                      {receivedRating.feedback && (
                        <Text mt={3} color="gray.700" fontStyle="italic">
                          "{receivedRating.feedback}"
                        </Text>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardBody>
            </Card>
          )}
        </Container>
      </Box>
      </NavBar>

      {/* Edit Session Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={editData.scheduledDate}
                  onChange={(e) => setEditData({...editData, scheduledDate: e.target.value})}
                />
              </FormControl>

              <HStack w="full">
                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Duration (minutes)</FormLabel>
                <Input
                  type="number"
                  value={editData.duration}
                  onChange={(e) => setEditData({...editData, duration: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Format</FormLabel>
                <Select
                  value={editData.format}
                  onChange={(e) => setEditData({...editData, format: e.target.value})}
                >
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                  placeholder="Meeting link or physical location"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme={themeColor} onClick={handleUpdateSession}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notes Modal */}
      <Modal isOpen={isNotesOpen} onClose={onNotesClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Session Notes & References</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Add notes, references, or resources</FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes, links, or any reference material..."
                rows={10}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNotesClose}>
              Cancel
            </Button>
            <Button colorScheme={themeColor} onClick={handleUpdateNotes}>
              Save Notes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rating Modal */}
      <Modal isOpen={isRatingOpen} onClose={onRatingClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Rate {isTeacher ? 'Learner' : 'Teacher'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box>
                <Text mb={3} fontWeight="semibold">Select Rating:</Text>
                {renderRatingStars(rating, setRating)}
              </Box>

              <FormControl>
                <FormLabel>Feedback (Optional)</FormLabel>
                <Textarea
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRatingClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={themeColor}
              onClick={handleRateSession}
              isDisabled={rating === 0}
            >
              Submit Rating
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Session Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Cancellation Reason</FormLabel>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCancelClose}>
              Keep Session
            </Button>
            <Button 
              colorScheme="red" 
              onClick={() => handleStatusUpdate('cancelled', cancelReason)}
            >
              Confirm Cancellation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default SessionDetailPage;
