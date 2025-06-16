import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';

export default function VerifyOTP({ onVerify }) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      toast({
        title: 'Success!',
        description: 'Your email is now verified.',
        status: 'success',
        duration: 5000,
      });

      onVerify(); // Update global auth state
      navigate('/profile');
    } catch (error) {
      toast({
        title: 'Error',
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
        <Heading mb={2} textAlign="center" fontSize="2xl">
          Verify your email
        </Heading>
        <Text mb={6} textAlign="center" color="gray.600">
          Enter the 6-digit code sent to your email
        </Text>
        <form onSubmit={handleSubmit}>
          <FormControl id="otp" isRequired>
            <FormLabel>OTP Code</FormLabel>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </FormControl>
          <Button
            type="submit"
            isLoading={isLoading}
            colorScheme="blue"
            mt={4}
            w="full"
          >
            Verify
          </Button>
        </form>
      </Box>
    </Flex>
  );
}