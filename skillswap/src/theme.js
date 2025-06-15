import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    // Primary color palette (blue-based)
    primary: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE', // Main brand color
      600: '#2B6CB0', // Hover states
      700: '#2C5282', // Active states
      800: '#2A4365',
      900: '#1A365D',
    },
    // Secondary colors (used sparingly)
    secondary: {
      orange: '#DD6B20', // For warnings/urgent items
      green: '#38A169', // For success states
      red: '#E53E3E',   // For errors
    },
    // Gray scale
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600',
            transform: 'translateY(-1px)',
            boxShadow: 'md'
          },
          _active: {
            bg: 'primary.700',
            transform: 'translateY(0)'
          }
        },
        secondary: {
          bg: 'white',
          color: 'primary.500',
          border: '1px solid',
          borderColor: 'primary.500',
          _hover: {
            bg: 'primary.50',
            borderColor: 'primary.600'
          }
        },
        link: {
          color: 'primary.500',
          _hover: {
            textDecoration: 'underline',
            color: 'primary.600'
          }
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'lg',
          borderWidth: '1px',
          borderColor: 'gray.200',
          boxShadow: 'md',
          _hover: {
            borderColor: 'primary.200',
            transform: 'translateY(-2px)',
            boxShadow: 'lg'
          }
        }
      }
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'white',
          borderColor: 'gray.300',
          _hover: {
            borderColor: 'primary.300'
          },
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px primary.500'
          }
        }
      }
    }
  },
  styles: {
    global: () => ({
      'body': {
        bg: 'gray.50',
        color: 'gray.600',
        fontFamily: 'body'
      },
      'h1, h2, h3, h4': {
        color: 'gray.800',
        fontWeight: 'bold'
      },
      'a': {
        color: 'primary.500',
        _hover: {
          color: 'primary.600',
          textDecoration: 'underline'
        }
      },
      '.nav-link': {
        color: 'gray.600',
        _hover: {
          color: 'primary.500',
          textDecoration: 'none'
        }
      }
    })
  },
  // Other theme configs
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Poppins', sans-serif",
  },
  shadows: {
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)'
  }
});

export default theme;