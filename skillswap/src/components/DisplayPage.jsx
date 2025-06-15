import React from 'react';
import { Box } from '@chakra-ui/react';
import OuterNavBar from './OuterNavBar';
import DisplayPageContent from './DisplayPageContent';
import Footer from './Footer';

const DisplayPage = () => {
  return (
    <Box bg={'gray.50'}>
      <OuterNavBar />
      <DisplayPageContent />
      <Footer />
    </Box>
  );
};

export default DisplayPage;