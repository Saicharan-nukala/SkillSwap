'use client'
import { useNavigate } from 'react-router-dom'
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

export default function SignIn() {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate('/profile');
  };
  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} color="gray.800">Sign in to your account</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}>
          <Stack spacing={4}>
            <FormControl id="email">
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
            <FormControl id="password">
              <FormLabel color="gray.600">Password</FormLabel>
              <Input 
                type="password"
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
            <Stack spacing={10}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}>
                <Checkbox color="gray.600">Remember me</Checkbox>
                <Text 
                  color={'primary.500'}
                  _hover={{
                    color: 'primary.600',
                    textDecoration: 'underline'
                  }}
                  cursor="pointer">
                  Forgot password?
                </Text>
              </Stack>
              <Button
                bg={'primary.500'}
                color={'white'}
                fontWeight="medium"
                borderRadius="md"
                onClick={handleProfile}
                _hover={{
                  bg: 'primary.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                _active={{
                  bg: 'primary.700',
                  transform: 'translateY(0)'
                }}>
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}