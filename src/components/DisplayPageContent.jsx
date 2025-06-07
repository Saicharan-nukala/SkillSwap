'use client'

import {
    Box,
    Container,
    SimpleGrid,
    Image,
    Flex,
    Heading,
    Text,
    Stack,
    StackDivider,
    Icon,
    useColorModeValue,
    List,
    ListItem,
    ListIcon,
    Divider,
    Button
} from '@chakra-ui/react'
import { IoSwapHorizontal, IoStar, IoSearchSharp, IoCalendar } from 'react-icons/io5'
import {
    FaMoneyBillWave,
    FaExchangeAlt,
    FaUserClock,
    FaUsers
} from 'react-icons/fa'
import { FcIdea, FcCollaboration, FcClock, FcGraduationCap } from 'react-icons/fc'

const Feature = ({ text, icon, iconBg, subtext }) => {
    return (
        <Stack direction={'row'} align={'flex-start'}>
            <Flex w={8} h={8} align={'center'} justify={'center'} rounded={'full'} bg={iconBg} mt={1}>
                {icon}
            </Flex>
            <Stack spacing={1} justifyContent={'center'}>
                <Text fontWeight={600} fontSize={'lg'}>{text}</Text>
                <Text fontSize={'sm'} color={'gray.500'}>{subtext}</Text>
            </Stack>
        </Stack>
    )
}

const Card = ({ heading, description, icon }) => {
    return (
        <Box
            maxW={{ base: 'full', md: '275px' }}
            w={'full'}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={5}
            bg="white"
            borderColor="gray.200"
            boxShadow="md"
            _hover={{
                borderColor: 'primary.200',
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
            }}>
            <Stack align={'start'} spacing={2}>
                <Flex
                    w={16}
                    h={16}
                    align={'center'}
                    justify={'center'}
                    color={'white'}
                    rounded={'full'}
                    bg={useColorModeValue('gray.100', 'gray.700')}>
                    {icon}
                </Flex>
                <Box mt={2}>
                    <Heading size="md" color="gray.800">{heading}</Heading>
                    <Text mt={1} fontSize={'sm'} color="gray.600">
                        {description}
                    </Text>
                </Box>
                <Button 
                    variant={'link'} 
                    size={'sm'}
                    color="primary.500"
                    _hover={{
                        textDecoration: 'underline',
                        color: 'primary.600'
                    }}>
                    Learn more
                </Button>
            </Stack>
        </Box>
    )
}

export default function DisplayPageContent() {
    return (
        <Box bg="gray.50">
            {/* First Section - Our Story */}
            <Container maxW={'5xl'} py={12}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <Stack spacing={4}>
                        <Text
                            textTransform={'uppercase'}
                            color={'primary.500'}
                            fontWeight={600}
                            fontSize={'sm'}
                            bg={useColorModeValue('primary.50', 'primary.900')}
                            p={2}
                            alignSelf={'flex-start'}
                            rounded={'md'}>
                            Our Story
                        </Text>
                        <Heading color={'gray.800'}>Empowering Communities Through Knowledge Exchange</Heading>
                        <Text color={'gray.600'} fontSize={'lg'}>
                            At SkillSwap, we believe everyone has valuable knowledge to share and endless potential to grow. Our platform was born from a simple idea - what if learning wasn't about paying for courses, but about exchanging skills with others?
                        </Text>
                        <Stack
                            spacing={4}
                            divider={
                                <StackDivider borderColor={useColorModeValue('gray.100', 'gray.700')} />
                            }>
                            <Feature
                                icon={<Icon as={IoSwapHorizontal} color={'secondary.orange'} w={5} h={5} />}
                                iconBg={useColorModeValue('orange.100', 'orange.900')}
                                text={'Flexible Learning'}
                                subtext={'Schedule sessions that work with your calendar'}
                            />
                            <Feature
                                icon={<Icon as={IoStar} color={'secondary.green'} w={5} h={5} />}
                                iconBg={useColorModeValue('green.100', 'green.900')}
                                text={'Dual Rating System'}
                                subtext={'Rate teaching experiences and get feedback on your mentoring'}
                            />
                            <Feature
                                icon={<Icon as={IoSearchSharp} color={'primary.500'} w={5} h={5} />}
                                iconBg={useColorModeValue('primary.100', 'primary.900')}
                                text={'Progress Tracking'}
                                subtext={'Monitor your learning journey and skill development'}
                            />
                        </Stack>
                    </Stack>
                    <Flex>
                        <Image
                            rounded={'md'}
                            alt={'feature image'}
                            src={'/displaycontentimg.jpg'}
                            objectFit={'cover'}
                        />
                    </Flex>
                </SimpleGrid>
            </Container>

            {/* Second Section - Why Choose SkillSwap */}
            <Flex justify="center" width="full" my={4}>
                <Divider
                    borderWidth="1px"
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    width="80vw"
                    borderRadius="full"
                    mt={8}
                    mb={8}
                />
            </Flex>
            <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
                    <Heading fontSize={{ base: '2xl', sm: '4xl' }} fontWeight={'bold'} color="gray.800">
                        Why Choose SkillSwap?
                    </Heading>
                    <Text color={'gray.600'} fontSize={{ base: 'sm', sm: 'lg' }}>
                        Our innovative approach to learning breaks down barriers and creates opportunities for everyone
                    </Text>
                </Stack>
                {/* Benefits Section */}
                <Container maxW={'3xl'} mt={8} mb={12}>
                    <List spacing={4}>
                        <ListItem fontSize={'xl'} color="gray.600">
                            <ListIcon as={FaMoneyBillWave} color="primary.500" />
                            <b>Zero-Cost Education</b> - Learn without financial barriers
                        </ListItem>
                        <ListItem fontSize={'xl'} color="gray.600">
                            <ListIcon as={FaExchangeAlt} color="secondary.green" />
                            <b>Two-Way Growth</b> - Develop skills while helping others
                        </ListItem>
                        <ListItem fontSize={'xl'} color="gray.600">
                            <ListIcon as={FaUserClock} color="primary.400" />
                            <b>Personalized Pace</b> - Learn at your speed with customized guidance
                        </ListItem>
                        <ListItem fontSize={'xl'} color="gray.600">
                            <ListIcon as={FaUsers} color="secondary.orange" />
                            <b>Real Connections</b> - Build meaningful relationships through shared learning
                        </ListItem>
                    </List>
                </Container>

                <Flex justify="center" width="full" my={4}>
                    <Divider
                        borderWidth="1px"
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        width="80vw"
                        borderRadius="full"
                        mt={8}
                        mb={8}
                    />
                </Flex>

                {/* How It Works Section */}
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'} mt={12}>
                    <Heading fontSize={{ base: '2xl', sm: '3xl' }} fontWeight={'bold'} color="gray.800">
                        How It Works
                    </Heading>
                </Stack>

                <Container maxW={'8xl'} mt={12} mb={12}>
                    <Flex flexWrap="wrap" gridGap={6} justify="center">
                        <Card
                            heading={'Create Profile'}
                            icon={<Icon as={FcIdea} w={10} h={10} />}
                            description={'List skills you can teach and want to learn'}
                        />
                        <Card
                            heading={'Find Matches'}
                            icon={<Icon as={FcCollaboration} w={10} h={10} />}
                            description={'Connect with compatible learning partners'}
                        />
                        <Card
                            heading={'Start Swapping'}
                            icon={<Icon as={FcClock} w={10} h={10} />}
                            description={'Schedule your first knowledge exchange session'}
                        />
                        <Card
                            heading={'Grow Together'}
                            icon={<Icon as={FcGraduationCap} w={10} h={10} />}
                            description={'Track progress and expand your skill network'}
                        />
                    </Flex>
                </Container>
            </Box>
        </Box>
    )
}