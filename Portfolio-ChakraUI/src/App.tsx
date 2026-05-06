import {
  Box,
  Button,
  Container,
  FieldLabel,
  FieldRoot,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import type { FormEvent, ReactNode } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FaLaptopCode } from 'react-icons/fa6'
import { HiOutlineMail } from 'react-icons/hi'
import { SiHtml5, SiJavascript, SiReact } from 'react-icons/si'
import { TbFileCv } from 'react-icons/tb'

const accent = 'green.400'
const border = 'rgba(74, 222, 128, 0.45)'
const cardBg = 'rgba(23, 25, 28, 0.92)'

const skillTiles = [
  {
    icon: SiReact,
    title: 'REACT',
    subtitle: 'State & UI',
    color: '#61dafb',
  },
  {
    icon: SiJavascript,
    title: 'JAVASCRIPT',
    subtitle: 'ES modules & APIs',
    color: '#f7df1e',
  },
  {
    icon: SiHtml5,
    title: 'HTML / CSS',
    subtitle: 'Layout & a11y',
    color: '#e34f26',
  },
  {
    icon: FaLaptopCode,
    title: 'FULL-STACK',
    subtitle: 'End-to-end delivery',
    color: '#4ade80',
  },
]

const featuredProjects = [
  {
    title: 'Project Alpha: E-Commerce',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=640&q=80',
    href: '#',
  },
  {
    title: 'Project Beta: Analytics',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&q=80',
    href: '#',
  },
  {
    title: 'Project Gamma: Mobile Web',
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=640&q=80',
    href: '#',
  },
]

const navItems = [
  { label: 'ABOUT', href: '#about' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'CONTACT', href: '#contact' },
]

function App() {
  const onSubmitMessage = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <Box
      minH="100vh"
      bg="#07080a"
      color="gray.100"
      backgroundImage="radial-gradient(ellipse 80% 60% at 50% -20%, rgba(74, 222, 128, 0.12), transparent 55%)"
    >
      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
        <Flex
          as="header"
          align="center"
          justify="space-between"
          gap={4}
          pb={6}
          mb={2}
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Text fontWeight="bold" letterSpacing="tight" color="white">
            JR
          </Text>
          <HStack gap={{ base: 4, md: 10 }} as="nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="wider"
                color="gray.400"
                _hover={{ color: accent }}
                transition="color 0.2s ease"
              >
                {item.label}
              </Link>
            ))}
          </HStack>
        </Flex>

        <Box id="about" scrollMarginTop="6rem">
          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }}
            templateRows={{ lg: 'auto auto' }}
            gap={4}
            mb={{ base: 10, md: 14 }}
          >
            <GridItem colSpan={{ base: 1, lg: 5 }} rowSpan={{ base: 1, lg: 2 }}>
              <BentoCard h={{ base: 'auto', lg: '100%' }} minH={{ lg: '280px' }}>
                <VStack align="start" gap={3} justify="center" h="full">
                  <Heading
                    as="h1"
                    size="2xl"
                    lineHeight="1.05"
                    color="white"
                    textTransform="uppercase"
                    letterSpacing="tight"
                  >
                    Jaxson Richins
                  </Heading>
                  <Text
                    color={accent}
                    fontWeight="bold"
                    letterSpacing="widest"
                    fontSize="sm"
                  >
                    FRONT-END DEVELOPMENT
                  </Text>
                  <Text color="gray.400" fontSize="sm" maxW="sm">
                    Focused on polished interfaces, solid architecture, and
                    shipping features that feel great to use.
                  </Text>
                </VStack>
              </BentoCard>
            </GridItem>

            <GridItem colSpan={{ base: 1, lg: 7 }}>
              <Grid
                templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                gap={4}
                h={{ md: '100%' }}
              >
                <BentoCard minH="200px" p={0} overflow="hidden">
                  <Flex
                    align="center"
                    justify="center"
                    h="full"
                    minH="200px"
                    bg="linear-gradient(145deg, rgba(74,222,128,0.15) 0%, rgba(7,8,10,0.9) 55%, rgba(23,25,28,1) 100%)"
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      inset={0}
                      opacity={0.35}
                      bg="radial-gradient(circle at 30% 40%, rgba(74,222,128,0.4), transparent 50%)"
                    />
                    <FaLaptopCode size={88} color="#4ade80" style={{ opacity: 0.9 }} />
                  </Flex>
                </BentoCard>

                <BentoCard>
                  <VStack align="start" gap={4} h="full">
                    <Heading
                      as="h2"
                      size="lg"
                      color="white"
                      textTransform="uppercase"
                      letterSpacing="wide"
                      lineHeight="1.15"
                    >
                      Hello, I&apos;m a developer
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                      I build responsive web experiences with React and modern
                      tooling. I care about performance, accessibility, and
                      maintainable codebases that teams can grow with.
                    </Text>
                    <HStack flexWrap="wrap" gap={3} w="full">
                      <MiniSkillPill label="JavaScript" />
                      <MiniSkillPill label="Full-stack" />
                    </HStack>
                  </VStack>
                </BentoCard>
              </Grid>
            </GridItem>
          </Grid>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={{ base: 10, md: 14 }}>
          {skillTiles.map(({ icon: Icon, title, subtitle, color }) => (
            <BentoCard key={title} py={5}>
              <VStack gap={3} align="start">
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="xl"
                  bg="whiteAlpha.100"
                  borderWidth="1px"
                  borderColor={border}
                >
                  <Icon size={26} color={color} />
                </Flex>
                <Text fontWeight="bold" fontSize="sm" letterSpacing="wider" color="white">
                  {title}
                </Text>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  {subtitle}
                </Text>
              </VStack>
            </BentoCard>
          ))}
        </SimpleGrid>

        <Box id="projects" scrollMarginTop="6rem" mb={{ base: 10, md: 14 }}>
          <Heading
            as="h2"
            size="md"
            color={accent}
            letterSpacing="widest"
            mb={5}
            textTransform="uppercase"
          >
            Featured projects
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {featuredProjects.map((project) => (
              <BentoCard key={project.title} p={0} overflow="hidden">
                <Image
                  src={project.image}
                  alt=""
                  w="full"
                  h="160px"
                  objectFit="cover"
                />
                <Stack p={4} gap={3}>
                  <Text fontWeight="bold" fontSize="sm" color="white" lineHeight="short">
                    {project.title}
                  </Text>
                  <Link
                    href={project.href}
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wider"
                    color={accent}
                    _hover={{ color: 'green.300' }}
                  >
                    VIEW DETAILS →
                  </Link>
                </Stack>
              </BentoCard>
            ))}
          </SimpleGrid>
        </Box>

        <Box id="contact" scrollMarginTop="6rem">
          <Heading
            as="h2"
            size="md"
            color={accent}
            letterSpacing="widest"
            mb={5}
            textTransform="uppercase"
          >
            Contact &amp; get in touch
          </Heading>
          <Grid templateColumns={{ base: '1fr', lg: '1.4fr 1fr' }} gap={4}>
            <BentoCard>
              <HStack gap={3} mb={5}>
                <Flex
                  w={11}
                  h={11}
                  align="center"
                  justify="center"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor={border}
                  color={accent}
                >
                  <HiOutlineMail size={22} />
                </Flex>
                <Text fontWeight="bold" letterSpacing="wider" color="white">
                  SEND MESSAGE
                </Text>
              </HStack>
              <Stack as="form" gap={4} onSubmit={onSubmitMessage}>
                <FieldRoot>
                  <FieldLabel color="gray.400" fontSize="xs" letterSpacing="wider">
                    NAME
                  </FieldLabel>
                  <Input
                    placeholder="Your name"
                    bg="blackAlpha.400"
                    borderColor={border}
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                    _focus={{ borderColor: accent, boxShadow: '0 0 0 1px #4ade80' }}
                  />
                </FieldRoot>
                <FieldRoot>
                  <FieldLabel color="gray.400" fontSize="xs" letterSpacing="wider">
                    EMAIL
                  </FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    bg="blackAlpha.400"
                    borderColor={border}
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                    _focus={{ borderColor: accent, boxShadow: '0 0 0 1px #4ade80' }}
                  />
                </FieldRoot>
                <FieldRoot>
                  <FieldLabel color="gray.400" fontSize="xs" letterSpacing="wider">
                    MESSAGE
                  </FieldLabel>
                  <Textarea
                    placeholder="Tell me about your project…"
                    rows={4}
                    bg="blackAlpha.400"
                    borderColor={border}
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                    _focus={{ borderColor: accent, boxShadow: '0 0 0 1px #4ade80' }}
                    resize="vertical"
                  />
                </FieldRoot>
                <Button
                  type="submit"
                  variant="outline"
                  borderColor={accent}
                  color={accent}
                  _hover={{ bg: 'rgba(74, 222, 128, 0.12)' }}
                  letterSpacing="wider"
                  fontWeight="bold"
                >
                  SEND
                </Button>
              </Stack>
            </BentoCard>

            <VStack gap={4} align="stretch">
              <SocialCard
                icon={<FaLinkedin size={22} />}
                label="LinkedIn"
                href="https://www.linkedin.com/in/yourusername"
              />
              <SocialCard
                icon={<FaGithub size={22} />}
                label="GitHub"
                href="https://github.com/yourusername"
              />
              <SocialCard
                icon={<TbFileCv size={22} />}
                label="Resume"
                href="/resume.pdf"
              />
            </VStack>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}

function BentoCard({ children, h, minH, p, py, overflow }: BentoCardProps) {
  return (
    <Box
      h={h}
      minH={minH}
      p={p ?? { base: 4, md: 5 }}
      py={py}
      overflow={overflow}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={border}
      bg={cardBg}
      boxShadow="0 0 24px rgba(74, 222, 128, 0.06)"
    >
      {children}
    </Box>
  )
}

type BentoCardProps = {
  children: ReactNode
  h?: string | Record<string, string>
  minH?: string | Record<string, string>
  p?: number | string | Record<string, string | number>
  py?: number | string | Record<string, string | number>
  overflow?: string
}

function MiniSkillPill({ label }: { label: string }) {
  return (
    <Box
      px={3}
      py={2}
      rounded="lg"
      borderWidth="1px"
      borderColor={border}
      bg="blackAlpha.400"
    >
      <Text fontSize="xs" fontWeight="bold" color={accent} letterSpacing="wider">
        {label.toUpperCase()}
      </Text>
    </Box>
  )
}

function SocialCard({
  icon,
  label,
  href,
}: {
  icon: ReactNode
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      display="block"
      w="full"
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      _hover={{ textDecoration: 'none' }}
    >
      <BentoCard p={4}>
        <HStack gap={4}>
          <Flex
            w={11}
            h={11}
            align="center"
            justify="center"
            rounded="lg"
            borderWidth="1px"
            borderColor={border}
            color={accent}
          >
            {icon}
          </Flex>
          <Text fontWeight="bold" letterSpacing="wider" color="white">
            {label}
          </Text>
        </HStack>
      </BentoCard>
    </Link>
  )
}

export default App
