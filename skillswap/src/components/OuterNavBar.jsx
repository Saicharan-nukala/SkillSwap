'use client'
import {
  Box,
  Flex,
  Button,
  Stack,
  Image
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function SkillSwapNavBar() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <Box>
      <Flex
        bg={'white'}
        color={'gray.600'}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={'gray.200'}
        align={'center'}
        justify={'space-between'}>

        <Box width={{ base: "120px", md: "130px", lg: "150px" }} marginLeft={50}>
          <Image
            src="/SkillSwap_logo.png"
            alt="SkillSwap Logo"
            width={180}
            height={30}
            style={{
              width: '100%',
              height: 'auto'
            }}
          />
        </Box>

        {/* Sign In & Sign Up Buttons */}
        <Stack
          marginRight={50}
          direction={'row'}
          spacing={{ base: 2, md: 6 }}
          align={'center'}>
          <Button
            fontSize={'sm'}
            fontWeight={400}
            variant={'link'}
            onClick={handleSignIn}
            color={'primary.500'}
            _hover={{
              color: 'primary.600',
              textDecoration: 'underline'
            }}>
            Sign In
          </Button>
          <Button
            fontSize={'sm'}
            fontWeight={600}
            color={'white'}
            bg={'primary.500'}
            onClick={handleSignUp}
            px={{ base: 4, md: 6 }}
            borderRadius={'md'}
            _hover={{
              bg: 'primary.600',
              transform: 'translateY(-1px)',
              boxShadow: 'md'
            }}
            _active={{
              bg: 'primary.700',
              transform: 'translateY(0)'
            }}>
            Sign Up
          </Button>
        </Stack>
      </Flex>
    </Box>
  )
}