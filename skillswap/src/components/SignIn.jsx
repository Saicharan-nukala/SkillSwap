import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useToast,
} from '@chakra-ui/react';

export default function SignIn({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresVerification) {
          navigate(`/verify-otp?userId=${data.userId}`);
        } else {
          // Store the user object from response.data.data
          localStorage.setItem('user', JSON.stringify(data.data));
          // *** ADDED LINE HERE ***
          localStorage.setItem('token', data.token); // Store the JWT token
          console.log("Token : - ",data.token);
          onLogin(); // Call onLogin to update authentication state in App.jsx
          navigate('/my-profile');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box rounded="lg" bg="white" boxShadow="lg" p={8} maxW="md" w="full">
        <Heading mb={6} textAlign="center" fontSize="2xl">
          Sign in to your account
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </FormControl>
            <Button
              type="submit"
              isLoading={isLoading}
              colorScheme="blue"
              mt={4}
            >
              Sign In
            </Button>
          </Stack>
        </form>
        <Text mt={4} textAlign="center">
          Don't have an account?{' '}
          <Button variant="link" colorScheme="blue" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}