'use client'
import {
    Box,
    Heading,
    Text
} from '@chakra-ui/react'
import NavBar from './NavBar';
function Swaps() {
  return (
    <>
        <NavBar>
        <Box p={30}>
            <Heading>
                Hai Sai Charan
            </Heading>
            <Text>
                This is Current Skill Swaps Page where you can track current connection / current skill swaps going on
            </Text>
        </Box>
        </NavBar>
    </>
  )
}

export default Swaps;