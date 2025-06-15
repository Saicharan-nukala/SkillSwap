'use client'
import NavBar from './NavBar';

import {
    Box,
    Heading,
    Text,
} from '@chakra-ui/react'
function Learnings() {
  return (
    <>
    <NavBar>
        <Box>
            <Heading>
            Hai Sai Charan .This is Learnings Page.
            </Heading>
        </Box>
        <Text>
            Where You Can see your current Learnings.
        </Text>
    </NavBar>
    </>
  )
}

export default Learnings