'use client'
import NavBar from './NavBar';

import {
    Box,
    Heading,
    Text,
} from '@chakra-ui/react'
function NewSwaps() {
  return (
    <>
    <NavBar>
    <Box p={30}>
        <Heading>
            Hai Sai Charan
        </Heading>
        <Text>
            This is New Swaps Page where you can connect and build a skill swap
        </Text>
    </Box>
    </NavBar>
    </>
  )
}

export default NewSwaps