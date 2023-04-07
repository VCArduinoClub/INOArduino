import { ReactNode } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  // Spacer
  Container


} from '@chakra-ui/react';



import Syntaxh from '../styles/Syntaxh';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
type lesson = {
  path: string,
  title: string,
  description: string,
};


const Links = ['Dashboard', 'Simulator', 'Teams', 'Profile', 'Settings'];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}>
    {children}
  </Link>
);

export default function Layout({ lessons, children }: { lessons: any, children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Syntaxh theme={colorMode} />

      <Box position="fixed" w="100%" bg={useColorModeValue('gray.100', 'gray.900')} px={4}>

        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>

          <HStack spacing={8} alignItems={'center'}>

            <Box>

              <Link href="/">
                Home
                {/* <HamburgerIcon /> */}
              </Link>
            </Box>

            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Lessons
              </MenuButton>
              <MenuList>

                {lessons.map((lesson: lesson) => (
                  <MenuItem key={lesson.path.replace('.mdx', '')}><a href={`/lessons/${lesson.path.replace('.mdx', '')}`}>{lesson.title}</a></MenuItem>
                ))}

              </MenuList>
            </Menu>
            <HStack
              as={'nav'}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>

          </HStack>

          <Flex alignItems={'center'}>
            <Box px={2}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
            </Box>
            <Menu>

              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={
                    'https://avatars.githubusercontent.com/u/64346567?v=4'
                  }
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Link 1</MenuItem>
                <MenuItem>Link 2</MenuItem>
                <MenuDivider />
                <MenuItem>Link 3</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>


      </Box>

      <Box p={20}>{children}</Box>
    </>
  );
}

