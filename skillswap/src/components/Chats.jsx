import React from 'react'
import NavBar from './NavBar'


import {
    Box,
    Heading
} from '@chakra-ui/react'
function Chats() {
  return (
    <>
    <NavBar>
        <Box>
            <Heading>
                This is Chats Page.
            </Heading>
        </Box>
    </NavBar>
    </>
  )
}

export default Chats