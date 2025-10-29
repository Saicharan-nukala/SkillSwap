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
import { io } from 'socket.io-client';
import NavBar from './NavBar';

function ChatsPage() {
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

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

  // Socket.IO connection and event listeners
  // Socket.IO connection and event listeners
  useEffect(() => {
    if (!currentUserId) return;

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Notify server that user is online
    socket.emit('userOnline', currentUserId);

    // Listen for connection events
    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
      socket.emit('userOnline', currentUserId);
    });

    // Listen for all online users
    socket.on('allOnlineUsers', (users) => {
      console.log('📋 Online users:', users);
      setOnlineUsers(users);
    });

    // Listen for user status changes
    socket.on('userStatusChange', ({ userId, isOnline }) => {

      setOnlineUsers((prev) => {
        if (isOnline) {
          return [...new Set([...prev, userId])];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    // ✅ UPDATED: Listen for new messages with unread count
    socket.on('newMessage', (message) => {
      console.log('📩 New message received:', message);

      // Update messages list ONLY if viewing this swap
      if (message.swap === selectedSwap?._id || message.swapId === selectedSwap?._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      // ✅ ALWAYS update swaps list with unread count
      setSwaps((prevSwaps) => {
        return prevSwaps.map((swap) => {
          // Find the swap this message belongs to
          if (swap._id === message.swap || swap._id === message.swapId) {
            // Check if message is from the other user (not current user)
            const isFromOtherUser = message.sender?._id !== currentUserId &&
              message.sender !== currentUserId;

            // Only increment unread if:
            // 1. Message is from other user
            // 2. This swap is NOT currently selected
            const shouldIncrementUnread = isFromOtherUser &&
              swap._id !== selectedSwap?._id;

            return {
              ...swap,
              messages: [...(swap.messages || []), message],
              lastMessage: message,
              lastMessageTime: message.createdAt || new Date(),
              unreadCount: shouldIncrementUnread
                ? (swap.unreadCount || 0) + 1
                : (swap.unreadCount || 0)
            };
          }
          return swap;
        }).sort((a, b) => {
          // Sort by most recent message
          const timeA = new Date(a.lastMessageTime || a.createdAt || 0).getTime();
          const timeB = new Date(b.lastMessageTime || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      });
    });

    // ✅ Listen for swap list updates (alternative approach)
    socket.on('swapListUpdate', (data) => {
      console.log('📋 Swap list update received:', data);

      setSwaps((prevSwaps) => {
        return prevSwaps.map((swap) => {
          if (swap._id === data.swapId) {
            // Check if message is from other user
            const isFromOtherUser = data.lastMessage?.sender?._id !== currentUserId;
            const shouldIncrementUnread = isFromOtherUser &&
              swap._id !== selectedSwap?._id;

            return {
              ...swap,
              lastMessage: data.lastMessage,
              lastMessageTime: data.lastMessageTime,
              unreadCount: shouldIncrementUnread
                ? (swap.unreadCount || 0) + 1
                : (swap.unreadCount || 0)
            };
          }
          return swap;
        }).sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || a.createdAt || 0).getTime();
          const timeB = new Date(b.lastMessageTime || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      });
    });

    // Listen for messages read event
    socket.on('messagesRead', ({ swapId }) => {
      if (swapId === selectedSwap?._id) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender._id !== currentUserId ? { ...msg, read: true } : msg
          )
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('allOnlineUsers');
        socket.off('userStatusChange');
        socket.off('newMessage');
        socket.off('swapListUpdate');
        socket.off('messagesRead');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.disconnect();
      }
    };
  }, [currentUserId, selectedSwap]);
  useEffect(() => {
    if (selectedSwap) {
      setSwaps((prevSwaps) =>
        prevSwaps.map((swap) =>
          swap._id === selectedSwap._id
            ? { ...swap, unreadCount: 0 }
            : swap
        )
      );
    }
  }, [selectedSwap]);


  // Join room when swap is selected
  useEffect(() => {
    if (selectedSwap && socketRef.current) {
      socketRef.current.emit('joinRoom', selectedSwap._id);
      console.log(`🚪 Joined room: ${selectedSwap._id}`);

      // Mark messages as read when viewing a swap
      markMessagesAsRead(selectedSwap._id);
    }
  }, [selectedSwap]);

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
        s.status === 'accepted' || s.status === 'active' || s.status === 'completed' || s.status === 'pending'
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

  const markMessagesAsRead = async (swapId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:5000/api/swaps/${swapId}/messages/read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit('markAsRead', { swapId, userId: currentUserId });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSwap) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

      // Send message via API (server will emit socket event)
      await axios.post(
        `http://localhost:5000/api/swaps/${selectedSwap._id}/messages`,
        { content: newMessage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setNewMessage('');
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  // Check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId?.toString());
  };

  if (!loading && !currentUserId) {
    return (
      <Center h="100vh">
        <Text>Please log in to view chats</Text>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading chats...</Text>
      </Center>
    );
  }

  return (

    <NavBar>
      <Box
        w="100%"
        h={{ base: "calc(100vh - 60px)", md: "calc(100vh - 64px)" }}
        overflow="hidden"
      >
        <Grid
          templateColumns={{ base: "1fr", md: "25vw 1fr" }}
          gap={1}
          h="100%"
        >

          {/* Left - Conversations List */}
          <GridItem
          >
            <Card h="100%" overflowY="auto">
              <VStack align="stretch" spacing={0}>
                <Box p={4} borderBottom="1px solid" borderBottomColor="gray.200">
                  <HStack>
                    <Icon as={FaComments} boxSize={6} color="blue.500" />
                    <Text fontSize="xl" fontWeight="bold">Messages</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">{swaps.length} conversations</Text>
                </Box>
                {swaps.length === 0 ? (
                  <Center p={8}>
                    <Text color="gray.500">No conversations yet</Text>
                  </Center>
                ) : (
                  swaps.map((swap) => {
                    const otherUser = swap.requester._id === currentUserId
                      ? swap.receiver
                      : swap.requester;

                    const lastMsg = swap.messages?.[swap.messages.length - 1] || swap.lastMessage;
                    const unreadCount = swap.unreadCount || 0;

                    return (
                      <Box
                        key={swap._id}
                        onClick={() => setSelectedSwap(swap)}
                        cursor="pointer"
                        bg={selectedSwap?._id === swap._id ? 'blue.50' : 'white'}
                        p={4}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        _hover={{ bg: 'gray.50' }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={3} justify="space-between">
                          <HStack spacing={3} flex={1} minW={0}>
                            <Avatar
                              size="md"
                              name={`${otherUser?.firstName} ${otherUser?.lastName}`}
                              src={otherUser?.avatar}
                            />

                            <VStack align="start" spacing={1} flex={1} minW={0}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                                  {otherUser?.firstName} {otherUser?.lastName}
                                </Text>
                                {isUserOnline(otherUser?._id) && (
                                  <Badge colorScheme="green" fontSize="xs">
                                    Online
                                  </Badge>
                                )}
                              </HStack>
                              <Text
                                fontSize="sm"
                                color={unreadCount > 0 ? "black" : "gray.600"}
                                fontWeight={unreadCount > 0 ? "semibold" : "normal"}
                                noOfLines={1}
                                w="100%"
                              >
                                {lastMsg?.content || 'No messages yet'}
                              </Text>
                            </VStack>
                          </HStack>

                          {/* ✅ Unread count badge */}
                          {unreadCount > 0 && (
                            <Badge
                              colorScheme="blue"
                              borderRadius="full"
                              minW="20px"
                              h="20px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                    );
                  })

                )}
              </VStack>
            </Card>
          </GridItem>
          {/* Right - Chat Area */}
          <GridItem display="flex" flexDirection="column" h="100%" overflow="hidden">
            {selectedSwap ? (
              <>
                {/* Chat Header */}
                {(() => {
                  const isRequester = selectedSwap.requester._id?.toString() === currentUserId?.toString();
                  const otherUser = isRequester ? selectedSwap.receiver : selectedSwap.requester;
                  const online = isUserOnline(otherUser._id);

                  return (
                    <Box
                      p={4}
                      borderBottom="1px solid"
                      borderBottomColor="gray.200"
                      bg="white"
                      flexShrink={0}
                    >
                      <HStack spacing={3}>
                        <Box position="relative">
                          <Avatar
                            size="md"
                            name={`${otherUser.firstName} ${otherUser.lastName}`}
                            src={otherUser.avatar}
                          />
                          {online && (
                            <Box
                              position="absolute"
                              bottom="0"
                              right="0"
                              w="12px"
                              h="12px"
                              bg="green.400"
                              borderRadius="full"
                              border="2px solid white"
                            />
                          )}
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="md">
                            {otherUser.firstName} {otherUser.lastName}
                          </Text>
                          <Text fontSize="xs" color={online ? "green.500" : "gray.500"}>
                            {online ? "● Online" : "Offline"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })()}

                {/* Messages Area - Scrollable */}
                <Box
                  flex="1"
                  overflowY="auto"
                  overflowX="hidden"
                  p={4}
                  bg="gray.50"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#cbd5e0',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#a0aec0',
                    },
                  }}
                >
                  {messages.length === 0 ? (
                    <Center h="100%">
                      <VStack spacing={2}>
                        <FaComments size={48} color="#CBD5E0" />
                        <Text color="gray.500" fontWeight="medium">No messages yet</Text>
                        <Text color="gray.400" fontSize="sm">Start the conversation</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <VStack spacing={3} align="stretch" pb={4}>
                      {messages.map((msg, idx) => {
                        // Handle potential sender object vs string
                        let msgSenderId;
                        if (msg.sender && typeof msg.sender === 'object') {
                          msgSenderId = msg.sender._id?.toString();
                        } else {
                          msgSenderId = msg.sender?.toString();
                        }
                        const isMine = msgSenderId === currentUserId;

                        return (
                          <React.Fragment key={msg._id || idx}>
                            {/* Message Bubble */}
                            <Flex justify={isMine ? 'flex-end' : 'flex-start'}>
                              <Box
                                maxW="70%"
                                bg={isMine ? 'blue.500' : 'white'}
                                color={isMine ? 'white' : 'gray.800'}
                                px={4}
                                py={2}
                                borderRadius="lg"
                                borderTopRightRadius={isMine ? '4px' : 'lg'}
                                borderTopLeftRadius={isMine ? 'lg' : '4px'}
                                boxShadow="sm"
                              >
                                <Text fontSize="sm" wordBreak="break-word">
                                  {msg.content}
                                </Text>
                                <HStack justify="flex-end" mt={1} spacing={1}>
                                  <Text fontSize="xs" opacity={0.8}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Text>
                                </HStack>
                              </Box>
                            </Flex>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </VStack>
                  )}
                </Box>

                {/* Message Input */}
                <Box
                  p={4}
                  borderTop="1px solid"
                  borderTopColor="gray.200"
                  bg="white"
                  flexShrink={0}
                >
                  <HStack spacing={2}>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                      }}
                      placeholder="Type a message..."
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
                  <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                    Press Enter to send, Shift+Enter for new line
                  </Text>
                </Box>
              </>
            ) : (
              <Center h="100%">
                <VStack spacing={2}>
                  <FaComments size={64} color="#CBD5E0" />
                  <Text color="gray.500" fontSize="lg" fontWeight="medium">
                    Select a conversation
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Choose from your contacts to start chatting
                  </Text>
                </VStack>
              </Center>
            )}
          </GridItem>

        </Grid>
      </Box>
    </NavBar>

  );
}

export default ChatsPage;
