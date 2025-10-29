import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  useToast,
  Stack
} from '@chakra-ui/react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields are filled
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        status: 'error',
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://skill-swap-backend-h15b.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast({
        title: 'Check your email!',
        description: 'We sent a 6-digit OTP to verify your account.',
        status: 'success',
        duration: 5000,
      });

      navigate(`/verify-otp?userId=${data.data.userId}`); // Note the change to data.data.userId
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box rounded="lg" bg="white" boxShadow="lg" p={8} maxW="md" w="full">
        <Heading mb={6} textAlign="center" fontSize="2xl">
          Create your account
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="firstName" isRequired>
              <FormLabel>First name</FormLabel>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="lastName" isRequired>
              <FormLabel>Last name</FormLabel>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
              />
            </FormControl>
            <Button
              type="submit"
              isLoading={isLoading}
              colorScheme="blue"
              mt={4}
              w="full"
            >
              Sign up
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}