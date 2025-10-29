'use client'

import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Image,
  Button,
  Badge,
  Tooltip,
  useBreakpointValue,
  Spinner,
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiUser,
} from 'react-icons/fi'
import { AddIcon, ChatIcon } from '@chakra-ui/icons'

import { FaBook, FaChalkboardTeacher, FaLink } from "react-icons/fa";
import axios from 'axios'
const LinkItems = [
  { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { name: 'Learning', icon: FaBook, path: '/learning' },
  { name: 'Teaching', icon: FaChalkboardTeacher, path: '/teaching' },
  { name: 'Connections', icon: FaLink, path: '/connections' },
  { name: 'Chats', icon: ChatIcon, path: '/chats' },
]

const SidebarContent = ({ onClose, isCollapsed, onToggleCollapse, ...rest }) => {
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) {
      onClose()
    }
  }
  
  const sidebarWidth = isCollapsed ? '80px' : '240px'

  return (
    <Box
      transition="width 0.3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={sidebarWidth}
      pos="fixed"
      h="full"
      zIndex={30}
      {...rest}>
      
      {/* Header with Logo and Collapse Toggle */}
      <Flex h="20" alignItems="center" justifyContent="space-between" px={isCollapsed ? "4" : "8"}>
        {!isCollapsed && (
          <Image
            src="/SkillSwap_logo.png"
            alt="SkillSwap Logo"
            h="40px"
            w="auto"
            transition="opacity 0.3s ease"
          />
        )}
        
        {/* Mobile Close Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onClose}
          variant="ghost"
          aria-label="Close sidebar"
          icon={<FiX />}
          size="sm"
          color="gray.600"
          _hover={{ bg: 'red.50', color: 'red.500' }}
        />
        
        {/* Desktop Collapse Toggle */}
        <IconButton
          display={{ base: 'none', md: 'flex' }}
          onClick={onToggleCollapse}
          variant="ghost"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          size="sm"
          color="gray.600"
          _hover={{ bg: 'primary.50' }}
          ml={isCollapsed ? 0 : "auto"}
        />
      </Flex>

      {/* Navigation Items */}
      <VStack spacing={2} align="stretch" px={isCollapsed ? "2" : "4"}>
        {LinkItems.map((link) => (
          <NavItem 
            key={link.name} 
            icon={link.icon}
            isCollapsed={isCollapsed}
            onClick={() => handleNavigation(link.path)}
          >
            {link.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  )
}

const NavItem = ({ icon, children, onClick, isCollapsed, ...rest }) => {
  const navItem = (
    <Box
      onClick={onClick}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      w="full">
      <Flex
        align="center"
        p="3"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'primary.50',
          color: 'primary.600',
        }}
        justifyContent={isCollapsed ? "center" : "flex-start"}
        transition="all 0.3s ease"
        {...rest}>
        {icon && (
          <Icon
            mr={isCollapsed ? "0" : "4"}
            fontSize="18"
            _groupHover={{
              color: 'primary.600',
            }}
            as={icon}
          />
        )}
        {!isCollapsed && (
          <Text
            fontSize="sm"
            fontWeight="medium"
            opacity={isCollapsed ? 0 : 1}
            transition="opacity 0.3s ease">
            {children}
          </Text>
        )}
      </Flex>
    </Box>
  )

  // Wrap with tooltip when collapsed
  if (isCollapsed) {
    return (
      <Tooltip
        label={children}
        placement="right"
        hasArrow
        bg="gray.900"
        color="white"
        fontSize="sm">
        {navItem}
      </Tooltip>
    )
  }

  return navItem
}

const MobileNav = ({ onOpen, sidebarWidth, userData, isLoadingUser, ...rest }) => {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const handleProfile = () => {
    if (userData?._id) {
      navigate(`/profile/${userData._id}`)
    } else {
      navigate('/my-profile')
    }
  }

  const handleNewSwaps = () => {
    navigate('/newswaps')
  }
   const handleNotification = () => {
    navigate('/notifications') 
  }

  const handleSignout = async () => {
    try {
      // Same signout logic as in SidebarContent
     
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('authToken')
      localStorage.clear()
      sessionStorage.clear()
      
      const cookies = document.cookie.split(";")
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${window.location.hostname};path=/`
        const domain = window.location.hostname.split('.').slice(-2).join('.')
        if (domain !== window.location.hostname) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.${domain};path=/`
        }
      })

      window.dispatchEvent(new Event('storage'))
      window.location.href = '/signin'
      
    } catch (error) {
      console.error('Error during signout:', error)
      window.location.href = '/signin'
    }
  }
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      if (!token) return

      const response = await axios.get('https://skill-swap-backend-h15b.onrender.com/api/swap-requests/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Count unmatched responses
      let count = 0
      response.data.data.forEach(request => {
        if (request.status !== 'matched' && request.responses) {
          count += request.responses.length
        }
      })
      
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching notification count:', error)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])
  return (
    <Flex
      ml={{ base: 0, md: sidebarWidth }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      transition="margin-left 0.3s ease"
      position="relative"
      zIndex={20}
      {...rest}>
      
      {/* Mobile Menu Button */}
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
        color="gray.600"
        _hover={{ bg: 'primary.50' }}
      />

      {/* Mobile Logo */}
      <Image
        src="/SkillSwap_logo.png"
        alt="SkillSwap Logo"
        h="40px"
        w="auto"
        display={{ base: 'flex', md: 'none' }}
      />

      {/* Right Side Actions */}
      <HStack spacing={{ base: '0', md: '6' }}>
        <Button
          variant={'primary'}
          size={'sm'}
          mr={4}
          onClick={handleNewSwaps}
          leftIcon={<AddIcon />}
          display={{ base: 'none', md: 'flex' }}
          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
          transition="all 0.2s ease">
          New Swaps
        </Button>
        
        <Box position="relative">
          <IconButton
            size={{ base: 'sm', md: 'md' }}
            variant="ghost"
            aria-label="open notifications"
            icon={<FiBell />}
            onClick={handleNotification}
            color="gray.600"
            _hover={{ bg: 'primary.50', color: 'primary.600' }}
          />
          {/* Notification Badge - Shows when there are unread notifications */}
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              px={2}
              py={0.5}
              boxShadow="md"
              zIndex={1}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
        
        <Flex alignItems={'center'} position="relative" zIndex={1001}>
          <Menu>
            <MenuButton 
              py={2} 
              transition="all 0.3s" 
              _focus={{ boxShadow: 'none' }}
              _hover={{ bg: 'primary.50' }}
              borderRadius="md"
              px={2}>
              <HStack>
                {isLoadingUser ? (
                  <Spinner size="sm" />
                ) : (
                  <Avatar
                    size={'sm'}
                    src={userData?.avatar}
                    name={userData?.name || userData?.firstName || 'User'}
                    bg='blue.500'
                    cursor="pointer"
                  />
                )}
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2">
                  <Text fontSize="sm" fontWeight="medium">
                    {isLoadingUser ? 'Loading...' : (userData?.firstName+ " " + userData.lastName|| 'User')}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {userData?.intrest || 'Member'}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow="lg"
              minW="200px"
              zIndex={1001}>
              <MenuItem 
                _hover={{ bg: 'primary.50' }} 
                onClick={handleProfile}
                icon={<Icon as={FiUser} />}>
                Profile
              </MenuItem>
              <MenuDivider />
              <MenuItem 
                _hover={{ bg: 'red.50' }} 
                color="red.500"
                fontWeight="medium"
                onClick={handleSignout}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
}

const NavBar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUser(true)
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser)
          
          // If we have userId, fetch fresh data from API
          if (parsedUser.userId || parsedUser._id) {
            const userId = parsedUser.userId || parsedUser._id
            const response = await fetch(`https://skill-swap-backend-h15b.onrender.com/api/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const freshUserData = await response.json()
              setUserData(freshUserData)
            } else {
              // Fall back to stored user data if API fails
              setUserData(parsedUser)
            }
          } else {
            // Use stored user data if no ID available
            setUserData(parsedUser)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Fall back to stored user data
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
        if (storedUser) {
          try {
            setUserData(JSON.parse(storedUser))
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError)
          }
        }
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserData()
  }, [])

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false)
    }
  }, [isMobile])

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const sidebarWidth = isCollapsed ? '80px' : '240px'

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Desktop Sidebar */}
      <SidebarContent 
        onClose={onClose} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        userData={userData}
        display={{ base: 'none', md: 'block' }} 
      />
      
      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs">
        <DrawerContent>
          <SidebarContent 
            onClose={onClose} 
            isCollapsed={false}
            onToggleCollapse={() => {}}
            userData={userData}
          />
        </DrawerContent>
      </Drawer>
      
      {/* Top Navigation */}
      <MobileNav 
        onOpen={onOpen} 
        isCollapsed={isCollapsed}
        sidebarWidth={sidebarWidth}
        userData={userData}
        isLoadingUser={isLoadingUser}
      />
      
      {/* Main Content */}
      <Box 
        ml={{ base: 0, md: sidebarWidth }} 
        p="6"
        transition="margin-left 0.3s ease"
        minH="calc(100vh - 80px)">
        {children}
      </Box>
    </Box>
  )
}

export default NavBar