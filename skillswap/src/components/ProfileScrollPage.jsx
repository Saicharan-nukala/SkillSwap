import React, { useState } from 'react';
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
  Select,
  Checkbox,
  Switch,
  Avatar
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon, AddIcon, SettingsIcon, DeleteIcon } from '@chakra-ui/icons';

const ProfileScrollPage = ({ isViewMode = false }) => {
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
  const toast = useToast();

  // State for editable content
  const [profileData, setProfileData] = useState({
    about: {
      intro: "I'm a passionate full-stack developer with a love for creating seamless user experiences and solving complex problems through clean, efficient code. My expertise spans across modern web technologies and frameworks.",
      experience: "With over 5 years of experience in web development, I specialize in building scalable applications that prioritize both functionality and user experience. I'm constantly learning new technologies and methodologies to stay at the forefront of development.",
      quote: "The best way to predict the future is to create it."
    },
    skills: [
      {
        category: 'Frontend Development',
        skills: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript'],
        colorScheme: 'blue'
      },
      {
        category: 'Backend Development',
        skills: ['Node.js', 'Python', 'Express', 'Django', 'PostgreSQL'],
        colorScheme: 'green'
      },
      {
        category: 'Design & Styling',
        skills: ['CSS3', 'Sass', 'Tailwind CSS', 'Figma', 'Adobe XD'],
        colorScheme: 'purple'
      },
      {
        category: 'Tools & Technologies',
        skills: ['Git', 'Docker', 'AWS', 'MongoDB', 'Firebase'],
        colorScheme: 'orange'
      }
    ],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'Tech Innovations Inc.',
        period: '2022 - Present',
        description: 'Led development of multiple React applications, improved performance by 40%, and mentored junior developers. Collaborated with cross-functional teams to deliver high-quality products.'
      },
      {
        title: 'Full Stack Developer',
        company: 'Digital Solutions Startup',
        period: '2020 - 2022',
        description: 'Built and maintained web applications using React, Node.js, and PostgreSQL. Implemented responsive designs and optimized database queries for better performance.'
      },
      {
        title: 'Junior Developer',
        company: 'Creative Web Agency',
        period: '2018 - 2020',
        description: 'Developed responsive websites and learned modern development practices. Gained experience with various CMS platforms and e-commerce solutions.'
      }
    ],
    projects: [
      {
        name: 'SkillSwap Platform',
        tech: 'React • Node.js • PostgreSQL',
        description: 'A comprehensive platform for skill exchange where users can teach and learn from each other. Features real-time messaging, booking system, and user ratings.'
      },
      {
        name: 'E-commerce Dashboard',
        tech: 'Vue.js • Express • MongoDB',
        description: 'A full-featured admin dashboard for e-commerce management with analytics, inventory tracking, and order processing capabilities.'
      },
      {
        name: 'Task Management App',
        tech: 'React • Firebase • Material-UI',
        description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.'
      },
      {
        name: 'Weather Analytics',
        tech: 'Python • D3.js • API Integration',
        description: 'A responsive weather analytics dashboard with beautiful data visualizations and historical weather pattern analysis.'
      }
    ],
    settings: {
      email: 'user@example.com',
      username: 'dev_user123',
    }
  });

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    ...(isViewMode ? [] : [{ id: 'settings', label: 'Settings' }])
  ];

  const colorSchemes = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'cyan', 'pink'];

  // Handle functions
  const handleAboutSubmit = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
    showToast('About section updated');
  };

  const handleAddSkillCategory = () => {
    setProfileData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          category: 'New Category',
          skills: [],
          colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
        }
      ]
    }));
    setEditCategoryIndex(profileData.skills.length);
    showToast('New skill category added');
  };

  const handleUpdateSkillCategory = (index, field, value) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    setProfileData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const handleAddSkill = (categoryIndex) => {
    if (newSkill.trim() === '') return;

    const updatedSkills = [...profileData.skills];
    updatedSkills[categoryIndex].skills.push(newSkill.trim());

    setProfileData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
    setNewSkill('');
    showToast('Skill added');
  };

  const handleRemoveSkill = (categoryIndex, skillIndex) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills[categoryIndex].skills.splice(skillIndex, 1);

    setProfileData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
    showToast('Skill removed', 'info');
  };

  const handleRemoveCategory = (categoryIndex) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills.splice(categoryIndex, 1);

    setProfileData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
    setEditCategoryIndex(null);
    showToast('Category removed', 'info');
  };

  const handleSettingsChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const toggleEditMode = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showToast = (title, status = 'success') => {
    toast({
      title,
      status,
      duration: 2000,
      isClosable: true,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <VStack align="start" spacing={8}>
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
              <Flex align="flex-start" >
                <Box>
                  <Flex direction="column" align="center" gap={2} my={5} width="30vw" >
                    <Avatar
                      size="xl">
                    </Avatar>
                    <Heading fontWeight="">
                      Sai Charan
                    </Heading>
                    <Text align="center">
                      FullStack Development | Gen AI |
                    </Text>
                  </Flex>
                </Box>
                <Box>
                  <Editable
                    p={5}
                    defaultValue={profileData.about.intro}
                    isPreviewFocusable={editMode.about && !isViewMode}
                    submitOnBlur={editMode.about && !isViewMode}
                    onSubmit={(value) => handleAboutSubmit('intro', value)}
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
                        w="33vw"  // Added minimum height
                        p={4}         // Added padding
                      />
                    )}
                  </Editable>
                  <Editable
                    p={5}
                    defaultValue={profileData.about.experience}
                    isPreviewFocusable={editMode.about && !isViewMode}
                    submitOnBlur={editMode.about && !isViewMode}
                    onSubmit={(value) => handleAboutSubmit('experience', value)}
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
                  defaultValue={profileData.about.quote}
                  isPreviewFocusable={editMode.about && !isViewMode}
                  submitOnBlur={editMode.about && !isViewMode}
                  onSubmit={(value) => handleAboutSubmit('quote', value)}
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
                      onClick={handleAddSkillCategory}
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
                          onChange={(e) => handleUpdateSkillCategory(index, 'category', e.target.value)}
                          onBlur={() => setEditCategoryIndex(null)}
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
                            onClick={() => handleRemoveCategory(index)}
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
                                onClick={() => handleRemoveSkill(index, skillIndex)}
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
                              onClick={() => handleAddSkill(index)}
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
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          experience: [
                            ...prev.experience,
                            {
                              title: 'New Position',
                              company: 'Company Name',
                              period: 'YYYY - Present',
                              description: 'Description of your role and achievements.'
                            }
                          ]
                        }));
                        showToast('New experience added');
                      }}
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
                        onSubmit={(value) => {
                          const updatedExp = [...profileData.experience];
                          updatedExp[index].title = value;
                          setProfileData(prev => ({ ...prev, experience: updatedExp }));
                        }}
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
                          onClick={() => {
                            const updatedExp = [...profileData.experience];
                            updatedExp.splice(index, 1);
                            setProfileData(prev => ({ ...prev, experience: updatedExp }));
                          }}
                        />
                      )}
                    </Flex>

                    <Flex wrap="wrap" gap={2}>
                      <Editable
                        defaultValue={job.company}
                        onSubmit={(value) => {
                          const updatedExp = [...profileData.experience];
                          updatedExp[index].company = value;
                          setProfileData(prev => ({ ...prev, experience: updatedExp }));
                        }}
                        isDisabled={!editMode.experience || isViewMode}
                      >
                        <EditablePreview fontWeight="medium" />
                        <EditableInput as={Input} size="sm" />
                      </Editable>
                      <Text>•</Text>
                      <Editable
                        defaultValue={job.period}
                        onSubmit={(value) => {
                          const updatedExp = [...profileData.experience];
                          updatedExp[index].period = value;
                          setProfileData(prev => ({ ...prev, experience: updatedExp }));
                        }}
                        isDisabled={!editMode.experience || isViewMode}
                      >
                        <EditablePreview fontWeight="medium" />
                        <EditableInput as={Input} size="sm" />
                      </Editable>
                    </Flex>

                    <Editable
                      defaultValue={job.description}
                      onSubmit={(value) => {
                        const updatedExp = [...profileData.experience];
                        updatedExp[index].description = value;
                        setProfileData(prev => ({ ...prev, experience: updatedExp }));
                      }}
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
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          projects: [
                            ...prev.projects,
                            {
                              name: 'New Project',
                              tech: 'Technologies used',
                              description: 'Project description and details.'
                            }
                          ]
                        }));
                        showToast('New project added');
                      }}
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
                      onClick={() => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects.splice(index, 1);
                        setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                      }}
                    />
                  )}

                  <VStack align="start" spacing={3}>
                    <Editable
                      fontSize="larger"
                      fontWeight="bold"
                      defaultValue={project.name}
                      onSubmit={(value) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[index].name = value;
                        setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                      }}
                      isDisabled={!editMode.projects || isViewMode}
                    >
                      <EditablePreview as={Heading} size="md" color="gray.800" />
                      <EditableInput as={Input} />
                    </Editable>

                    <Editable
                      defaultValue={project.tech}
                      onSubmit={(value) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[index].tech = value;
                        setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                      }}
                      isDisabled={!editMode.projects || isViewMode}
                    >
                      <EditablePreview fontSize="sm" color="gray.600" fontWeight="medium" />
                      <EditableInput as={Input} size="sm" />
                    </Editable>

                    <Editable
                      defaultValue={project.description}
                      onSubmit={(value) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[index].description = value;
                        setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                      }}
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
                  value={profileData.settings.email}
                  onChange={(e) => handleSettingsChange('email', e.target.value)}
                  isDisabled={isViewMode}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  value={profileData.settings.username}
                  onChange={(e) => handleSettingsChange('username', e.target.value)}
                  isDisabled={isViewMode}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Change Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  isDisabled={isViewMode}
                />
              </FormControl>



              {!isViewMode && (
                <Button
                  colorScheme="blue"
                  mt={8}
                  onClick={() => {
                    toggleEditMode('settings');
                    showToast('Settings saved');
                  }}
                >
                  Save Settings
                </Button>
              )}
            </VStack>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box minH="100vh"   marginTop="-4vh" width="83vw" >
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
                    // Reset edit mode when switching tabs
                    setEditMode(() => ({
                      about: false,
                      skills: false,
                      experience: false,
                      projects: false,
                      settings: false
                    }));
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