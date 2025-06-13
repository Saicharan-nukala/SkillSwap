'use client'

import {
  Box,
  Flex,
  Avatar,
  HStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Stack,
  Image,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons'

const Links = ['Dashboard', 'Projects', 'Team']

const NavLink = ({ children }) => {
  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: 'primary.100',
        color: 'primary.600',
      }}
      href={'#'}>
      {children}
    </Box>
  )
}

export default function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Box bg="white" px={4} borderBottom="1px" borderColor="gray.200">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            color="gray.600"
            _hover={{ bg: 'primary.50' }}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <Image 
                src="/SkillSwap_logo.png" // Update this path
                alt="Company Logo"
                h="40px" // Adjust height as needed
                w="auto"
              />
            </Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Button
              variant={'primary'}
              size={'sm'}
              mr={4}
              leftIcon={<AddIcon />}>
              Action
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                />
              </MenuButton>
              <MenuList borderColor="gray.200" boxShadow="lg">
                <MenuItem _hover={{ bg: 'primary.50' }}>Link 1</MenuItem>
                <MenuItem _hover={{ bg: 'primary.50' }}>Link 2</MenuItem>
                <MenuDivider />
                <MenuItem _hover={{ bg: 'primary.50' }}>Link 3</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }} bg="white">
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  )
}