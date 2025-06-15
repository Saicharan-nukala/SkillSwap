'use client'

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'} color="gray.800">
            Sign up
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}>
          <Stack spacing={4}>
            <HStack>
              <Box>
                <FormControl id="firstName" isRequired>
                  <FormLabel color="gray.600">First Name</FormLabel>
                  <Input 
                    type="text"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: 'primary.300'
                    }}
                    _focus={{
                      borderColor: 'primary.500',
                      boxShadow: '0 0 0 1px primary.500'
                    }}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl id="lastName">
                  <FormLabel color="gray.600">Last Name</FormLabel>
                  <Input 
                    type="text"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{
                      borderColor: 'primary.300'
                    }}
                    _focus={{
                      borderColor: 'primary.500',
                      boxShadow: '0 0 0 1px primary.500'
                    }}
                  />
                </FormControl>
              </Box>
            </HStack>
            <FormControl id="email" isRequired>
              <FormLabel color="gray.600">Email address</FormLabel>
              <Input 
                type="email"
                bg="white"
                borderColor="gray.300"
                _hover={{
                  borderColor: 'primary.300'
                }}
                _focus={{
                  borderColor: 'primary.500',
                  boxShadow: '0 0 0 1px primary.500'
                }}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel color="gray.600">Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  bg="white"
                  borderColor="gray.300"
                  _hover={{
                    borderColor: 'primary.300'
                  }}
                  _focus={{
                    borderColor: 'primary.500',
                    boxShadow: '0 0 0 1px primary.500'
                  }}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    color="gray.500"
                    _hover={{
                      color: 'primary.500'
                    }}
                    onClick={() => setShowPassword((showPassword) => !showPassword)}>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={'primary.500'}
                color={'white'}
                fontWeight="medium"
                borderRadius="md"
                _hover={{
                  bg: 'primary.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                _active={{
                  bg: 'primary.700',
                  transform: 'translateY(0)'
                }}>
                Sign up
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={'center'} color="gray.600">
                Already a user?{' '}
                <Link 
                  color={'primary.500'}
                  _hover={{
                    color: 'primary.600',
                    textDecoration: 'underline'
                  }}>
                  SignIn
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}