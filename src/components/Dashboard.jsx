'use client'
import NavBar from "./NavBar";
import {
    Box,
    Image,
    Flex,
    Avatar,
    Text,
    Heading,
    VStack,
    Button,
    Divider,
    Card,
    CardBody,
    SimpleGrid,
    Icon
} from '@chakra-ui/react'
import { FiUser, FiUsers, FiFileText } from 'react-icons/fi'

function Dashboard() {
    return (
        <NavBar>
            <Box p={8}>
                <Heading mb={4}>
                    Hai Sai Charan
                </Heading>
                <Text>
                    This is Dashboard
                </Text>
            </Box>
        </NavBar>
    )
}

export default Dashboard;