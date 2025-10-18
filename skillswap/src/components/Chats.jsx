// src/pages/Chats/ChatsPage.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Avatar,
  Text,
  Textarea,
  IconButton,
  Center,
  Spinner,
  Card,
  Flex,
  Icon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import {
  FaPaperPlane,
  FaComments,
} from 'react-icons/fa';
import axios from 'axios';
import NavBar from './NavBar';

function ChatsPage() {
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Get user ID on mount
  useEffect(() => {
    const getUserId = () => {
      try {
        let userStr = localStorage.getItem('user');
        if (!userStr) userStr = sessionStorage.getItem('user');
        
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user._id || user.id || user.userId;
          
          if (userId) {
            setCurrentUserId(userId);
            return userId;
          }
        }
        return null;
      } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
      }
    };

    const id = getUserId();
    if (id) {
      fetchSwaps(id);
    } else {
      setLoading(false);
    }
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when swap changes
  useEffect(() => {
    if (selectedSwap && currentUserId) {
      fetchMessages(selectedSwap._id);
    }
  }, [selectedSwap]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('accessToken') ||
                    sessionStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/swaps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const activeSwaps = response.data.data.filter(s => 
        s.status === 'accepted' || s.status === 'active'
      );
      
      setSwaps(activeSwaps);
      
      if (activeSwaps.length > 0) {
        setSelectedSwap(activeSwaps[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (swapId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:5000/api/swaps/${swapId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSwap) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      await axios.post(
        `http://localhost:5000/api/swaps/${selectedSwap._id}/messages`,
        { content: newMessage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setNewMessage('');
      fetchMessages(selectedSwap._id);
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  if (!loading && !currentUserId) {
    return (
      <NavBar>
        <Center h="80vh">
          <Text fontSize="xl" color="gray.600">Please log in to view chats</Text>
        </Center>
      </NavBar>
    );
  }

  if (loading) {
    return (
      <NavBar>
        <Center h="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading chats...</Text>
          </VStack>
        </Center>
      </NavBar>
    );
  }

  return (
    <NavBar>
      <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 6 }}>
        <Container maxW="container.2xl">
          <Card h="calc(100vh - 150px)" overflow="hidden">
            <Grid templateColumns={{ base: '1fr', md: '350px 1fr' }} h="full">
              
              {/* Left - Conversations List */}
              <GridItem borderRight="1px solid" borderColor="gray.200" overflowY="auto">
                <VStack spacing={0} align="stretch">
                  <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                    <Text fontWeight="bold" fontSize="lg">Messages</Text>
                    <Text fontSize="sm" color="gray.600">{swaps.length} conversations</Text>
                  </Box>
                  
                  {swaps.length === 0 ? (
                    <Center py={12}>
                      <VStack>
                        <Icon as={FaComments} boxSize={12} color="gray.300" />
                        <Text color="gray.500">No conversations yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    swaps.map((swap) => {
                      const isRequester = swap.requester._id?.toString() === currentUserId?.toString();
                      const otherUser = isRequester ? swap.receiver : swap.requester;
                      const isSelected = selectedSwap?._id === swap._id;
                      const lastMessage = swap.messages?.[swap.messages.length - 1];
                      const unreadCount = swap.messages?.filter(m => 
                        !m.read && m.sender?._id !== currentUserId
                      ).length || 0;
                      
                      return (
                        <Box
                          key={swap._id}
                          p={4}
                          bg={isSelected ? 'blue.50' : 'white'}
                          borderLeft={isSelected ? '4px solid' : 'none'}
                          borderColor="blue.500"
                          cursor="pointer"
                          onClick={() => setSelectedSwap(swap)}
                          _hover={{ bg: isSelected ? 'blue.50' : 'gray.50' }}
                          borderBottom="1px solid"
                          borderBottomColor="gray.100"
                          position="relative"
                        >
                          <HStack spacing={3} align="start">
                            <Avatar 
                              size="md" 
                              name={`${otherUser.firstName} ${otherUser.lastName}`} 
                              src={otherUser.avatar} 
                            />
                            <VStack align="start" spacing={0} flex={1} minW={0}>
                              <Text fontWeight="bold" fontSize="sm">
                                {otherUser.firstName} {otherUser.lastName}
                              </Text>
                              <Text fontSize="xs" color="gray.600" isTruncated maxW="200px">
                                {lastMessage 
                                  ? lastMessage.content 
                                  : 'No messages yet'}
                              </Text>
                            </VStack>
                            {unreadCount > 0 && (
                              <Badge colorScheme="blue" borderRadius="full" px={2}>
                                {unreadCount}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      );
                    })
                  )}
                </VStack>
              </GridItem>

              {/* Right - Chat Area */}
              <GridItem display="flex" flexDirection="column">
                {selectedSwap ? (
                  <>
                    {/* Chat Header */}
                    <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="white">
                      {(() => {
                        const isRequester = selectedSwap.requester._id?.toString() === currentUserId?.toString();
                        const otherUser = isRequester ? selectedSwap.receiver : selectedSwap.requester;
                        return (
                          <HStack spacing={3}>
                            <Avatar 
                              size="md" 
                              name={`${otherUser.firstName} ${otherUser.lastName}`} 
                              src={otherUser.avatar} 
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">
                                {otherUser.firstName} {otherUser.lastName}
                              </Text>
                              <Text fontSize="xs" color="green.500">● Online</Text>
                            </VStack>
                          </HStack>
                        );
                      })()}
                    </Box>

                    {/* Messages Area */}
                    <Box flex={1} overflowY="auto" p={4} bg="gray.50">
                      {messages.length === 0 ? (
                        <Center h="full">
                          <VStack>
                            <Icon as={FaComments} boxSize={16} color="gray.300" />
                            <Text color="gray.500">No messages yet</Text>
                            <Text fontSize="sm" color="gray.400">Start the conversation</Text>
                          </VStack>
                        </Center>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          {messages.map((msg, idx) => {
                            const isMine = msg.sender?._id === currentUserId;
                            return (
                              <Flex key={idx} justify={isMine ? 'flex-end' : 'flex-start'}>
                                <Box
                                  maxW="70%"
                                  bg={isMine ? 'blue.500' : 'white'}
                                  color={isMine ? 'white' : 'black'}
                                  px={4}
                                  py={2}
                                  borderRadius="lg"
                                  boxShadow="sm"
                                >
                                  <Text fontSize="sm" whiteSpace="pre-wrap">{msg.content}</Text>
                                  <Text 
                                    fontSize="xs" 
                                    opacity={0.7} 
                                    mt={1}
                                    textAlign="right"
                                  >
                                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </Text>
                                </Box>
                              </Flex>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </VStack>
                      )}
                    </Box>

                    {/* Message Input */}
                    <Box p={4} borderTop="1px solid" borderColor="gray.200" bg="white">
                      <HStack spacing={2}>
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          size="sm"
                          resize="none"
                          rows={2}
                          borderRadius="lg"
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
                          isLoading={sending}
                          isDisabled={!newMessage.trim()}
                          aria-label="Send message"
                          size="lg"
                          borderRadius="lg"
                        />
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={2}>
                        Press Enter to send, Shift+Enter for new line
                      </Text>
                    </Box>
                  </>
                ) : (
                  <Center h="full" bg="gray.50">
                    <VStack>
                      <Icon as={FaComments} boxSize={20} color="gray.300" />
                      <Text fontSize="xl" color="gray.500">Select a conversation</Text>
                      <Text fontSize="sm" color="gray.400">Choose from your contacts to start chatting</Text>
                    </VStack>
                  </Center>
                )}
              </GridItem>
            </Grid>
          </Card>
        </Container>
      </Box>
    </NavBar>
  );
}

export default ChatsPage;
