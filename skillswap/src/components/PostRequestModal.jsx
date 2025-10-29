// src/pages/NewSwaps/PostRequestModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
  Text,
  Divider,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import axios from 'axios';

const PostRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    offering: {
      skillName: '',
      category: '',
      experienceLevel: 'intermediate',
      description: ''
    },
    lookingFor: {
      skillName: '',
      category: '',
      experienceLevel: 'intermediate',
      description: ''
    },
    preferences: {
      format: 'online',
      sessionDuration: 60,
      frequency: 'weekly'
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://skill-swap-backend-h15b.onrender.com/api/swap-requests',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast({
        title: 'Request Posted!',
        description: 'Your skill swap request is now live',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });

      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        offering: {
          skillName: '',
          category: '',
          experienceLevel: 'intermediate',
          description: ''
        },
        lookingFor: {
          skillName: '',
          category: '',
          experienceLevel: 'intermediate',
          description: ''
        },
        preferences: {
          format: 'online',
          sessionDuration: 60,
          frequency: 'weekly'
        }
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to post request',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Post Skill Swap Request</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <form onSubmit={handleSubmit} id="post-request-form">
            <VStack spacing={6} align="stretch">
              
              {/* What You're Offering */}
              <VStack align="stretch" spacing={4} bg="green.50" p={4} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" color="green.700">
                  🎓 What I Can Teach
                </Text>
                
                <FormControl isRequired>
                  <FormLabel>Skill Name</FormLabel>
                  <Input
                    placeholder="e.g., React Development"
                    bg="white"
                    value={formData.offering.skillName}
                    onChange={(e) => setFormData({
                      ...formData,
                      offering: { ...formData.offering, skillName: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Input
                    placeholder="e.g., Frontend Development"
                    bg="white"
                    value={formData.offering.category}
                    onChange={(e) => setFormData({
                      ...formData,
                      offering: { ...formData.offering, category: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>My Experience Level</FormLabel>
                  <Select
                    bg="white"
                    value={formData.offering.experienceLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      offering: { ...formData.offering, experienceLevel: e.target.value }
                    })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Describe what you can teach and your expertise..."
                    bg="white"
                    rows={4}
                    value={formData.offering.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      offering: { ...formData.offering, description: e.target.value }
                    })}
                  />
                </FormControl>
              </VStack>

              <Divider />

              {/* What You're Looking For */}
              <VStack align="stretch" spacing={4} bg="blue.50" p={4} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" color="blue.700">
                  📚 What I Want to Learn
                </Text>
                
                <FormControl isRequired>
                  <FormLabel>Skill Name</FormLabel>
                  <Input
                    placeholder="e.g., Node.js Backend"
                    bg="white"
                    value={formData.lookingFor.skillName}
                    onChange={(e) => setFormData({
                      ...formData,
                      lookingFor: { ...formData.lookingFor, skillName: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Input
                    placeholder="e.g., Backend Development"
                    bg="white"
                    value={formData.lookingFor.category}
                    onChange={(e) => setFormData({
                      ...formData,
                      lookingFor: { ...formData.lookingFor, category: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Desired Level</FormLabel>
                  <Select
                    bg="white"
                    value={formData.lookingFor.experienceLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      lookingFor: { ...formData.lookingFor, experienceLevel: e.target.value }
                    })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>What I want to learn</FormLabel>
                  <Textarea
                    placeholder="Describe what you want to learn..."
                    bg="white"
                    rows={4}
                    value={formData.lookingFor.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      lookingFor: { ...formData.lookingFor, description: e.target.value }
                    })}
                  />
                </FormControl>
              </VStack>

              <Divider />

              {/* Preferences */}
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" fontWeight="bold">
                  ⚙️ Learning Preferences
                </Text>
                
                <FormControl>
                  <FormLabel>Format</FormLabel>
                  <Select
                    value={formData.preferences.format}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, format: e.target.value }
                    })}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Session Duration (minutes)</FormLabel>
                  <NumberInput
                    min={30}
                    max={180}
                    step={15}
                    value={formData.preferences.sessionDuration}
                    onChange={(value) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, sessionDuration: parseInt(value) }
                    })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    value={formData.preferences.frequency}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, frequency: e.target.value }
                    })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="flexible">Flexible</option>
                  </Select>
                </FormControl>
              </VStack>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            form="post-request-form"
            isLoading={loading}
            loadingText="Posting..."
          >
            Post Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PostRequestModal;
