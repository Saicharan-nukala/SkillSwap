'use client'

import {
    Box,
    Button,
    Flex,
    Image,
    Divider,
    Container,
    Stack,
    Text,
    useColorModeValue,
    VisuallyHidden,
} from '@chakra-ui/react'
import { FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaGithub } from 'react-icons/fa'

const SocialButton = ({
    children,
    label,
    href,
}) => {
    return (
        <Button
            bg={useColorModeValue('gray.100', 'gray.700')}
            rounded={'full'}
            w={8}
            h={8}
            cursor={'pointer'}
            as={'a'}
            href={href}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            transition={'background 0.3s ease'}
            _hover={{
                bg: useColorModeValue('primary.100', 'primary.200'),
                color: 'primary.500'
            }}>
            <VisuallyHidden>{label}</VisuallyHidden>
            {children}
        </Button>
    )
}

export default function Footer() {
    return (
        <Box
            bg={useColorModeValue('gray.50', 'gray.900')}
            color={useColorModeValue('gray.600', 'gray.200')}>
            <Flex justify="center" width="full" my={4}>
                <Divider
                    borderWidth="1px"
                    borderColor="gray.200"
                    width="80vw"
                    borderRadius="full"
                />
            </Flex>
            <Container
                as={Stack}
                maxW={'6xl'}
                py={4}
                direction={{ base: 'column', md: 'row' }}
                spacing={4}
                justify={{ base: 'center', md: 'space-between' }}
                align={{ base: 'center', md: 'center' }}>
                <Text color="gray.600">© {new Date().getFullYear()} SkillSwap. All rights reserved</Text>
                <Stack direction={'row'} spacing={6}>
                    <SocialButton label={'Twitter'} href={'https://twitter.com/skillswap'}>
                        <FaTwitter />
                    </SocialButton>
                    <SocialButton label={'YouTube'} href={'https://youtube.com/skillswap'}>
                        <FaYoutube />
                    </SocialButton>
                    <SocialButton label={'Instagram'} href={'https://instagram.com/skillswap'}>
                        <FaInstagram />
                    </SocialButton>
                    <SocialButton label={'LinkedIn'} href={'https://linkedin.com/company/skillswap'}>
                        <FaLinkedin />
                    </SocialButton>
                    <SocialButton label={'GitHub'} href={'https://github.com/skillswap'}>
                        <FaGithub />
                    </SocialButton>
                </Stack>
            </Container>
            <Container
                as={Stack}
                maxW={'6xl'}
                py={2}
                direction={{ base: 'column', md: 'row' }}
                spacing={2}
                justify={'center'}
                align={'center'}>
                <Text fontSize={'sm'} textAlign={'center'} color="gray.600">
                    Trade Knowledge, Grow Together - The peer-to-peer learning platform where skills are the currency
                </Text>
            </Container>
        </Box>
    )
}