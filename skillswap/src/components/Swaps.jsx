'use client'
import {
    Box,
    Heading,
    Text
} from '@chakra-ui/react'
import NavBar from './NavBar';
function Connections() {
  return (
    <>
        <NavBar>
        <Box p={30}>
            <Heading>
                Hai Sai Charan
            </Heading>
            <Text>
                This is Current Skill Connections Page where you can track current connection / current skill Connections going on
            </Text>
        </Box>
        </NavBar>
    </>
  )
}

export default Connections;