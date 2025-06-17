import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Container,
  Heading,
  Button,
  Grid,
  GridItem,
  SimpleGrid,
  Input,
  Tag,
  Textarea,
  useToast,
  Editable,
  EditableInput,
  EditableTextarea,
  EditablePreview,
  IconButton,
  FormControl,
  FormLabel,
  Avatar,
  Progress,
  Tooltip,
  Spinner
} from '@chakra-ui/react';
import { EditIcon, CloseIcon, AddIcon, SettingsIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';

const ProfileScrollPage = ({ isViewMode = false, userId }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [editMode, setEditMode] = useState({
    about: false,
    skills: false,
    experience: false,
    projects: false,
    settings: false
  });
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsSaving] = useState(false);
  const toast = useToast();

  const defaultProfileData = {
    // Define a sensible default structure to prevent errors if API call fails
    about: { intro: "", experience: "", quote: "" },
    avatar: "",
    email: "",
    experience: [],
    firstName: "",
    lastName: "",
    projects: [],
    settings: { profileVisibility: "public", emailNotifications: {} },
    skills: [],
    username: "",
  };

  const [profileData, setProfileData] = useState(defaultProfileData);

  // Calculate profile completion
  const calculateProfileCompletion = (data) => {
    // Your existing logic for calculating profile completion
    let completedFields = 0;
    let totalFields = 0;

    if (data.firstName) completedFields++;
    totalFields++;
    if (data.lastName) completedFields++;
    totalFields++;
    if (data.email) completedFields++;
    totalFields++;
    if (data.about?.intro) completedFields++;
    totalFields++;
    if (data.about?.experience) completedFields++;
    totalFields++;
    if (data.skills?.length > 0) completedFields++;
    totalFields++;
    if (data.experience?.length > 0) completedFields++;
    totalFields++;
    if (data.projects?.length > 0) completedFields++;
    totalFields++;

    const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    setProfileCompletion(completionPercentage);
  };

  // Save profile data to backend
  const saveProfileData = async (updatedData) => {
    try {
      setIsSaving(true);
      // Retrieve the token from localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        // If no token is found, prevent the request and inform the user
        showToast('Authentication required to save profile.', 'error');
        setIsSaving(false);
        return;
      }
      console.log("token : - ", token);
      const response = await axios.put(`http://localhost:5000/api/users/${userId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}` // <--- ADD THIS LINE
        }
      });

      // ... (rest of your existing code for handling successful response)
      const data = {
        ...defaultProfileData,
        ...response.data,
        about: {
          ...defaultProfileData.about,
          ...response.data.about
        },
        settings: {
          ...defaultProfileData.settings,
          ...response.data.settings,
          emailNotifications: {
            ...defaultProfileData.settings.emailNotifications,
            ...(response.data.settings?.emailNotifications || {})
          }
        }
      };
      setProfileData(data); // Update local state with data from backend response
      calculateProfileCompletion(data); // Recalculate completion
      showToast('Profile updated');
      return data;

    } catch (error) {
      console.log(error.config.url);
      console.log('Making request to:', `http://localhost:5000/api/users/${userId}`);
      console.log('With data:', updatedData);
      showToast(error.response?.data?.message || 'Could not save profile data', 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token'); // or however you store the token

        console.log('Making request to:', `http://localhost:5000/api/users/${userId}`);
        console.log('With token:', token ? 'Token exists' : 'No token');

        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Make sure token is included
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse);
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        console.log('Received data:', data);
        console.log('Received data about:', data.about);

        // --- THE CRUCIAL CHANGE IS HERE ---
        // Merge fetched data with defaultProfileData to ensure all fields exist
        const mergedData = {
          ...defaultProfileData,
          ...data,
          about: {
            ...defaultProfileData.about,
            ...data.about
          },
          settings: {
            ...defaultProfileData.settings,
            ...data.settings,
            emailNotifications: {
              ...defaultProfileData.settings.emailNotifications,
              ...(data.settings?.emailNotifications || {})
            }
          }
        };
        setProfileData(mergedData); // Update the state with the fetched and merged data
        calculateProfileCompletion(mergedData); // Recalculate completion based on fetched data
        // --- END OF CRUCIAL CHANGE ---

      } catch (error) {
        console.error('Fetch error:', error);
        showToast('Failed to load profile data.', 'error');
        // Optionally, reset to defaultProfileData on error
        setProfileData(defaultProfileData);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) { // Only fetch if userId is available
      fetchUserData();
    } else {
      setIsLoading(false); // If no userId, stop loading and show default
      setProfileData(defaultProfileData);
      toast({
        title: 'User ID Missing',
        description: 'No user ID provided to fetch profile.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [userId, toast]); // Dependency array: re-run if userId or toast changes

  const showToast = (title, status = 'success') => {
    toast({
      title,
      status,
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle section updates for 'about'
  const handleAboutSubmit = async (field, value) => {
    const updatedData = {
      ...profileData,
      about: {
        ...profileData.about,
        [field]: value
      }
    };
    await saveProfileData(updatedData); // Call saveProfileData to persist changes
  };

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    ...(isViewMode ? [] : [{ id: 'settings', label: 'Settings' }])
  ];

  const handleAddSkillCategory = async () => {
    const colorSchemes = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'cyan', 'pink'];
    const updatedData = {
      ...profileData,
      skills: [
        ...profileData.skills,
        {
          category: 'New Category',
          skills: [],
          colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
        }
      ]
    };
    const savedData = await saveProfileData(updatedData); // Call saveProfileData
    setEditCategoryIndex(savedData.skills.length - 1);
  };


  // Handle local state updates without saving
  const handleSkillCategoryChange = (index, field, value) => {
    const updatedData = {
      ...profileData,
      skills: profileData.skills.map((category, i) =>
        i === index ? { ...category, [field]: value } : category
      )
    };
    setProfileData(updatedData);
  };

  // Handle submission when editing is done
  const handleSkillCategorySubmit = async (index, field, value) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    await saveProfileData({
      ...profileData,
      skills: updatedSkills
    });
    setEditCategoryIndex(null); // Exit edit mode after saving
  };

  const handleAddSkill = async (categoryIndex) => {
    if (newSkill.trim() === '') return;

    const updatedSkills = [...profileData.skills];
    updatedSkills[categoryIndex].skills.push(newSkill.trim());

    await saveProfileData({ // Call saveProfileData
      ...profileData,
      skills: updatedSkills
    });
    setNewSkill('');
  };

  const handleRemoveSkill = async (categoryIndex, skillIndex) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills[categoryIndex].skills.splice(skillIndex, 1);
    await saveProfileData({ // Call saveProfileData
      ...profileData,
      skills: updatedSkills
    });
  };

  const handleRemoveCategory = async (categoryIndex) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills.splice(categoryIndex, 1);
    await saveProfileData({ // Call saveProfileData
      ...profileData,
      skills: updatedSkills
    });
    setEditCategoryIndex(null);
  };

  const handleAddExperience = async () => {
    const updatedData = {
      ...profileData,
      experience: [
        ...profileData.experience,
        {
          title: 'New Position',
          company: 'Company Name',
          period: 'YYYY - Present',
          description: 'Description of your role and achievements.'
        }
      ]
    };
    await saveProfileData(updatedData); // Call saveProfileData
  };

  const handleUpdateExperience = async (index, field, value) => {
    const updatedExperience = [...profileData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    await saveProfileData({ // Call saveProfileData
      ...profileData,
      experience: updatedExperience
    });
  };

  const handleRemoveExperience = async (index) => {
    const updatedExperience = [...profileData.experience];
    updatedExperience.splice(index, 1);
    await saveProfileData({ // Call saveProfileData
      ...profileData,
      experience: updatedExperience
    });
  };

  const handleAddProject = async () => {
    const updatedData = {
      ...profileData,
      projects: [
        ...profileData.projects,
        {
          name: 'New Project',
          tech: 'Technologies used',
          description: 'Project description and details.'
        }
      ]
    };
    await saveProfileData(updatedData); // Call saveProfileData
  };

  const handleUpdateProject = async (index, field, value) => {
    const updatedProjects = [...profileData.projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    await saveProfileData({ // Call saveProfileData
      ...profileData,
      projects: updatedProjects
    });
  };

  const handleRemoveProject = async (index) => {
    const updatedProjects = [...profileData.projects];
    updatedProjects.splice(index, 1);
    await saveProfileData({ // Call saveProfileData
      ...profileData,
      projects: updatedProjects
    });
  };

  // Changed handleSettingsChange to immediately save (Option 1 from previous response)
  const handleSettingsChange = async (field, value) => {
    // If 'email' or 'username' are top-level fields, update profileData directly
    if (field === 'email' || field === 'username') {
      await saveProfileData({
        ...profileData,
        [field]: value
      });
    } else {
      // Otherwise, update within the settings object
      const updatedData = {
        ...profileData,
        settings: {
          ...profileData.settings,
          [field]: value
        }
      };
      await saveProfileData(updatedData); // Call saveProfileData
    }
  };


  const toggleEditMode = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  // No need for this check if defaultProfileData is set and isLoading handles initial state
  // if (!profileData) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <VStack align="start" spacing={8}>
            {/* About section header */}
            <Flex justify="space-between" w="full" align="center">
              <Box>
                <Heading size="lg" color="gray.800" mb={4} fontWeight="semibold">
                  About Me
                </Heading>
                <Box w="32px" h="3px" bg="gray.800" mb={8} />
              </Box>
              {!isViewMode && (
                <Button
                  leftIcon={<EditIcon />}
                  size="sm"
                  onClick={() => toggleEditMode('about')}
                  variant={editMode.about ? "solid" : "outline"}
                  colorScheme={editMode.about ? "blue" : "gray"}
                >
                  {editMode.about ? "Done Editing" : "Edit Section"}
                </Button>
              )}
            </Flex>

            <VStack align="start" spacing={6} color="gray.600">
              <Flex align="flex-start">
                <Box>
                  <Flex direction="column" align="center" gap={2} my={5} width="30vw">
                    <Avatar
                      size="xl"
                      src={profileData.avatar}
                      name={`${profileData.firstName} ${profileData.lastName}`}
                    />
                    <Heading fontWeight="">
                      {profileData.firstName} {profileData.lastName}
                    </Heading>
                    <Text align="center">
                      {/* Assuming 'Hai' was a placeholder, replaced with a more dynamic field or removed */}
                      {profileData.about?.quote || ''}
                    </Text>
                  </Flex>
                </Box>
                <Box>
                  <Editable
                    p={5}
                    defaultValue={profileData.about?.intro || ''}
                    isPreviewFocusable={editMode.about && !isViewMode}
                    submitOnBlur={editMode.about && !isViewMode}
                    onSubmit={(value) => handleAboutSubmit('intro', value)} // Calls handleAboutSubmit
                    isDisabled={!editMode.about || isViewMode}
                  >
                    <EditablePreview
                      fontSize="md"
                      lineHeight="1.7"
                      {...((editMode.about && !isViewMode) ? {
                        border: "1px dashed",
                        borderColor: "gray.300",
                        p: 2,
                        borderRadius: "md"
                      } : {})}
                    />
                    {(editMode.about && !isViewMode) && (
                      <EditableTextarea
                        autoresize
                        fontSize="md"
                        lineHeight="1.7"
                        w="33vw"
                        p={4}
                      />
                    )}
                  </Editable>
                  <Editable
                    p={5}
                    defaultValue={profileData.about?.experience || ''}
                    isPreviewFocusable={editMode.about && !isViewMode}
                    submitOnBlur={editMode.about && !isViewMode}
                    onSubmit={(value) => handleAboutSubmit('experience', value)} // Calls handleAboutSubmit
                    isDisabled={!editMode.about || isViewMode}
                  >
                    <EditablePreview
                      fontSize="sm"
                      lineHeight="1.6"
                      {...((editMode.about && !isViewMode) ? {
                        border: "1px dashed",
                        borderColor: "gray.300",
                        p: 2,
                        borderRadius: "md"
                      } : {})}
                    />
                    {(editMode.about && !isViewMode) && (
                      <EditableTextarea fontSize="sm" lineHeight="1.6" w="33vw" autoresize />
                    )}
                  </Editable>
                </Box>
              </Flex>

              <Box
                mt={8}
                p={6}
                bg="gray.50"
                borderRadius="lg"
                borderLeft="4px"
                borderLeftColor="gray.800"
                w="full"
              >
                <Editable
                  defaultValue={profileData.about?.quote || ''}
                  isPreviewFocusable={editMode.about && !isViewMode}
                  submitOnBlur={editMode.about && !isViewMode}
                  onSubmit={(value) => handleAboutSubmit('quote', value)} // Calls handleAboutSubmit
                  isDisabled={!editMode.about || isViewMode}
                >
                  <EditablePreview
                    fontStyle="italic"
                    color="gray.600"
                    {...((editMode.about && !isViewMode) ? {
                      border: "1px dashed",
                      borderColor: "gray.300",
                      p: 2,
                      borderRadius: "md"
                    } : {})}
                  />
                  {(editMode.about && !isViewMode) && (
                    <EditableInput fontStyle="italic" color="gray.600" />
                  )}
                </Editable>
              </Box>
            </VStack>
          </VStack>
        );
      case 'skills':
        return (
          <VStack align="start" spacing={10}>
            <Flex justify="space-between" w="full" align="center">
              <Box>
                <Heading size="lg" color="gray.800" mb={4} fontWeight="semibold">
                  Skills
                </Heading>
                <Box w="32px" h="3px" bg="gray.800" mb={8} />
              </Box>
              {!isViewMode && (
                <Flex>
                  <Button
                    leftIcon={<EditIcon />}
                    size="sm"
                    onClick={() => toggleEditMode('skills')}
                    variant={editMode.skills ? "solid" : "outline"}
                    colorScheme={editMode.skills ? "blue" : "gray"}
                    mr={2}
                  >
                    {editMode.skills ? "Done Editing" : "Edit Section"}
                  </Button>
                  {editMode.skills && (
                    <Button
                      leftIcon={<AddIcon />}
                      size="sm"
                      onClick={handleAddSkillCategory} // Calls handleAddSkillCategory
                      colorScheme="blue"
                    >
                      Add Category
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8} w="full">
              {profileData.skills.map((category, index) => (
                <GridItem key={index}>
                  <VStack align="start" spacing={4}>
                    <Flex align="center" w="full" justify="space-between">
                      {editCategoryIndex === index && editMode.skills && !isViewMode ? (
                        <Input
                          value={category.category}
                          onChange={(e) => handleSkillCategoryChange(index, 'category', e.target.value)}
                          onBlur={(e) => handleSkillCategorySubmit(index, 'category', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSkillCategorySubmit(index, 'category', e.target.value);
                            }
                            if (e.key === 'Escape') {
                              setEditCategoryIndex(null);
                            }
                          }}
                          autoFocus
                          variant="flushed"
                          fontWeight="medium"
                          fontSize="lg"
                        />
                      ) : (
                        <Heading
                          size="md"
                          color="gray.800"
                          mb={4}
                          fontWeight="large"
                          cursor={editMode.skills && !isViewMode ? "pointer" : "default"}
                          onClick={editMode.skills && !isViewMode ? () => setEditCategoryIndex(index) : undefined}
                        >
                          {category.category}
                        </Heading>
                      )}
                      {editMode.skills && !isViewMode && (
                        <HStack>
                          <IconButton
                            aria-label="Edit category"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditCategoryIndex(index)}
                          />
                          <IconButton
                            aria-label="Delete category"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleRemoveCategory(index)} // Calls handleRemoveCategory
                          />
                        </HStack>
                      )}
                    </Flex>

                    {/* Skills Grid - Max 3 per row with wrapping */}
                    <Box w="full">
                      <SimpleGrid
                        columns={{ base: 1, sm: 2, md: 3 }}
                        spacing={3}
                        w="full"
                        mb={editMode.skills && !isViewMode ? 4 : 0}
                      >
                        {category.skills.map((skill, skillIndex) => (
                          <Flex key={skillIndex} align="center" gap={2}>
                            <Tag
                              size="md"
                              px={3}
                              py={2}
                              flex="1"
                              justifyContent="center"
                              maxW="full"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                              bg="blue.50"
                            >
                              {skill}
                            </Tag>
                            {editMode.skills && !isViewMode && (
                              <IconButton
                                aria-label="Remove skill"
                                icon={<CloseIcon />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                borderRadius="full"
                                minW="auto"
                                h="20px"
                                w="20px"
                                flexShrink={0}
                                onClick={() => handleRemoveSkill(index, skillIndex)} // Calls handleRemoveSkill
                              />
                            )}
                          </Flex>
                        ))}
                      </SimpleGrid>

                      {/* Add New Skill Section */}
                      {editMode.skills && !isViewMode && (
                        <Box w="full">
                          <Flex gap={2} align="center" maxW="300px">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add new skill"
                              size="sm"
                              borderRadius="md"
                              flex="1"
                            />
                            <Button
                              size="sm"
                              borderRadius="md"
                              colorScheme="blue"
                              onClick={() => handleAddSkill(index)} // Calls handleAddSkill
                              flexShrink={0}
                            >
                              Add
                            </Button>
                          </Flex>
                        </Box>
                      )}
                    </Box>
                  </VStack>
                </GridItem>
              ))}
            </Grid>

            <Box mt={12}>
              <Text color="gray.600" lineHeight="1.7">
                I'm passionate about learning new technologies and staying updated with the latest
                trends in web development. Currently exploring advanced React patterns, serverless
                architectures, and modern deployment strategies.
              </Text>
            </Box>
          </VStack>
        );
      case 'experience':
        return (
          <VStack align="start" spacing={12}>
            <Flex justify="space-between" w="full" align="center">
              <Box>
                <Heading size="lg" color="gray.800" mb={4}>
                  Experience
                </Heading>
                <Box w="48px" h="4px" bg="gray.800" mb={8} />
              </Box>
              {!isViewMode && (
                <Flex>
                  <Button
                    leftIcon={<EditIcon />}
                    size="sm"
                    onClick={() => toggleEditMode('experience')}
                    variant={editMode.experience ? "solid" : "outline"}
                    colorScheme={editMode.experience ? "blue" : "gray"}
                    mr={2}
                  >
                    {editMode.experience ? "Done Editing" : "Edit Section"}
                  </Button>
                  {editMode.experience && (
                    <Button
                      leftIcon={<AddIcon />}
                      size="sm"
                      onClick={handleAddExperience} // Calls handleAddExperience
                      colorScheme="blue"
                    >
                      Add Experience
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>

            <VStack align="start" spacing={8} w="full">
              {profileData.experience.map((job, index) => (
                <Box key={index} position="relative" pl={8} w="full">
                  <Box
                    position="absolute"
                    left={0}
                    top={2}
                    w="3"
                    h="3"
                    bg="gray.800"
                    borderRadius="full"
                  />
                  <Box
                    position="absolute"
                    left="5px"
                    top={5}
                    bottom={index === profileData.experience.length - 1 ? 5 : -8}
                    w="2px"
                    bg="gray.200"
                  />
                  <VStack align="start" spacing={2}>
                    <Flex w="full" justify="space-between" align="center">
                      <Editable
                        fontSize="larger"
                        fontWeight="bold"
                        defaultValue={job.title}
                        onSubmit={(value) => handleUpdateExperience(index, 'title', value)} // Calls handleUpdateExperience
                        isDisabled={!editMode.experience || isViewMode}
                      >
                        <EditablePreview as={Heading} size="md" color="gray.800" />
                        <EditableInput as={Input} />
                      </Editable>
                      {editMode.experience && !isViewMode && (
                        <IconButton
                          aria-label="Delete experience"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleRemoveExperience(index)} // Calls handleRemoveExperience
                        />
                      )}
                    </Flex>

                    <Flex wrap="wrap" gap={2}>
                      <Editable
                        defaultValue={job.company}
                        onSubmit={(value) => handleUpdateExperience(index, 'company', value)} // Calls handleUpdateExperience
                        isDisabled={!editMode.experience || isViewMode}
                      >
                        <EditablePreview fontWeight="medium" />
                        <EditableInput as={Input} size="sm" />
                      </Editable>
                      <Text>•</Text>
                      <Editable
                        defaultValue={job.period}
                        onSubmit={(value) => handleUpdateExperience(index, 'period', value)} // Calls handleUpdateExperience
                        isDisabled={!editMode.experience || isViewMode}
                      >
                        <EditablePreview fontWeight="medium" />
                        <EditableInput as={Input} size="sm" />
                      </Editable>
                    </Flex>

                    <Editable
                      defaultValue={job.description}
                      onSubmit={(value) => handleUpdateExperience(index, 'description', value)} // Calls handleUpdateExperience
                      w="full"
                      isDisabled={!editMode.experience || isViewMode}
                    >
                      <EditablePreview
                        color="gray.600"
                        lineHeight="1.7"
                        whiteSpace="pre-wrap"
                      />
                      <EditableTextarea
                        color="gray.600"
                        lineHeight="1.7"
                        whiteSpace="pre-wrap"
                        minH="100px"
                      />
                    </Editable>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        );
      case 'projects':
        return (
          <VStack align="start" spacing={12}>
            <Flex justify="space-between" w="full" align="center">
              <Box>
                <Heading size="lg" color="gray.800" mb={4}>
                  Projects
                </Heading>
                <Box w="48px" h="4px" bg="gray.800" mb={8} />
              </Box>
              {!isViewMode && (
                <Flex>
                  <Button
                    leftIcon={<EditIcon />}
                    size="sm"
                    onClick={() => toggleEditMode('projects')}
                    variant={editMode.projects ? "solid" : "outline"}
                    colorScheme={editMode.projects ? "blue" : "gray"}
                    mr={2}
                  >
                    {editMode.projects ? "Done Editing" : "Edit Section"}
                  </Button>
                  {editMode.projects && (
                    <Button
                      leftIcon={<AddIcon />}
                      size="sm"
                      onClick={handleAddProject} // Calls handleAddProject
                      colorScheme="blue"
                    >
                      Add Project
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              {profileData.projects.map((project, index) => (
                <Box
                  key={index}
                  p={6}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  transition="all 0.2s"
                  _hover={{
                    shadow: 'md',
                    transform: 'translateY(-2px)'
                  }}
                  position="relative"
                >
                  {editMode.projects && !isViewMode && (
                    <IconButton
                      aria-label="Delete project"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      position="absolute"
                      top={2}
                      right={2}
                      onClick={() => handleRemoveProject(index)} // Calls handleRemoveProject
                    />
                  )}

                  <VStack align="start" spacing={3}>
                    <Editable
                      fontSize="larger"
                      fontWeight="bold"
                      defaultValue={project.name}
                      onSubmit={(value) => handleUpdateProject(index, 'name', value)} // Calls handleUpdateProject
                      isDisabled={!editMode.projects || isViewMode}
                    >
                      <EditablePreview as={Heading} size="md" color="gray.800" />
                      <EditableInput as={Input} />
                    </Editable>

                    <Editable
                      defaultValue={project.tech}
                      onSubmit={(value) => handleUpdateProject(index, 'tech', value)} // Calls handleUpdateProject
                      isDisabled={!editMode.projects || isViewMode}
                    >
                      <EditablePreview fontSize="sm" color="gray.600" fontWeight="medium" />
                      <EditableInput as={Input} size="sm" />
                    </Editable>

                    <Editable
                      defaultValue={project.description}
                      onSubmit={(value) => handleUpdateProject(index, 'description', value)} // Calls handleUpdateProject
                      w="full"
                      isDisabled={!editMode.projects || isViewMode}
                    >
                      <EditablePreview
                        color="gray.600"
                        lineHeight="1.7"
                        whiteSpace="pre-wrap"
                      />
                      <EditableTextarea
                        color="gray.600"
                        lineHeight="1.7"
                        whiteSpace="pre-wrap"
                        minH="100px"
                      />
                    </Editable>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        );
      case 'settings':
        return (
          <VStack align="start" spacing={8} w="65vw">
            <Box w="full">
              <Heading size="lg" color="gray.800" mb={4} fontWeight="semibold">
                Profile Settings
              </Heading>
              <Box w="32px" h="3px" bg="gray.800" mb={8} />
            </Box>

            <VStack align="start" spacing={6} w="full">

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={profileData.email} // Access email from top-level profileData
                  onChange={(e) => handleSettingsChange('email', e.target.value)} // Calls handleSettingsChange
                  isDisabled={isViewMode}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Change Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  isDisabled={isViewMode}
                // Note: Password changes should ideally be a separate, secure process
                // This input is just for demonstration, not actually hooked up to backend password change
                />
              </FormControl>

              {/* Removing "Save Settings" button as changes are saved on input change (Option 1) */}
              {/* {!isViewMode && (
                <Button
                  colorScheme="blue"
                  mt={8}
                  onClick={() => {
                    // No explicit save needed here if handleSettingsChange saves immediately
                    toggleEditMode('settings'); // This might be used to exit edit mode
                    showToast('Settings saved');
                  }}
                >
                  Save Settings
                </Button>
              )} */}
            </VStack>
          </VStack>
        );
      default:
        return null;
    }
  };
  // Add Progress Bar at the top of the component
  return (
    <Box minH="100vh" marginTop="-4vh" width="83vw">
      {/* Profile Completion Progress Bar */}
      <Box px={6} py={4} bg="white" borderBottom="1px" borderColor="gray.200">
        <Flex align="center">
          <Text fontSize="sm" fontWeight="medium" mr={3}>
            Profile Completion: {profileCompletion}%
          </Text>
          <Progress
            value={profileCompletion}
            size="sm"
            width="200px"
            colorScheme={profileCompletion >= 70 ? 'green' : profileCompletion >= 40 ? 'yellow' : 'red'}
            borderRadius="md"
          />
          <Tooltip label="Complete your profile to increase visibility">
            <Text ml={2} fontSize="xs" color="gray.500">
              {profileCompletion < 50 ? 'Keep going!' : profileCompletion < 80 ? 'Looking good!' : 'Excellent!'}
            </Text>
          </Tooltip>
        </Flex>
      </Box>

      {/* Navigation */}
      <Box
        position="sticky"
        top={0}
        zIndex={1000}
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(12px)"
        borderBottom="1px"
        borderColor="gray.100"
        py={4}
      >
        <Container maxW="container.lg">
          <HStack spacing={8} justify="center">
            {tabs.map((tab) => (
              <Box key={tab.id} position="relative">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setEditMode({
                      about: false,
                      skills: false,
                      experience: false,
                      projects: false,
                      settings: false
                    });
                  }}
                  color={activeTab === tab.id ? 'gray.800' : 'gray.600'}
                  fontWeight={activeTab === tab.id ? 'semibold' : 'normal'}
                  fontSize="md"
                  px={0}
                  py={2}
                  h="auto"
                  _hover={{
                    color: 'gray.800',
                    bg: 'transparent'
                  }}
                  transition="all 0.2s"
                  leftIcon={tab.id === 'settings' ? <SettingsIcon /> : undefined}
                >
                  {tab.label}
                </Button>
                {activeTab === tab.id && (
                  <Box
                    position="absolute"
                    bottom={-2}
                    left={0}
                    right={0}
                    h="2px"
                    bg="gray.800"
                    transition="all 0.3s"
                  />
                )}
              </Box>
            ))}
          </HStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.lg" px={6} py={12}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default ProfileScrollPage;