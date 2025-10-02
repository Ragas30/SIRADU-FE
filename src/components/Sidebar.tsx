import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Button,
  Spacer,
} from "@chakra-ui/react";
import {
  Home,
  LogOut,
  Stethoscope,
  UserRound,
  LayoutDashboard,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useColorModeValue } from "./ui/color-mode";

const MotionBox = motion(Box);

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  //   { label: "Users", icon: Users, to: "/users" },
  { label: "Perawat", icon: Stethoscope, to: "/nurses" },
  { label: "Pasien", icon: UserRound, to: "/patients" },
  //   { label: "Settings", icon: Settings, to: "/settings" },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const bgActive = useColorModeValue("blue.500", "blue.600");
  const bgActiveHover = useColorModeValue("blue.600", "blue.700");
  const bgHover = useColorModeValue("gray.100", "gray.700");

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Flex
      direction="column"
      w="260px"
      minH="100vh"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      pos="fixed"
      p={4}
    >
      {/* Logo */}
      <Flex align="center" mb={10} gap={2}>
        <Box
          w="36px"
          h="36px"
          bg="blue.500"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={Home} color="white" boxSize={5} />
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          SIRADU
        </Text>
      </Flex>

      {/* Menu Items */}
      <VStack align="stretch" gap={1} flex="1">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to}>
            {({ isActive }) => (
              <MotionBox
                display="flex"
                alignItems="center"
                gap={3}
                px={4}
                py={2.5}
                borderRadius="md"
                fontWeight={isActive ? "600" : "500"}
                bg={isActive ? bgActive : "transparent"}
                color={
                  isActive ? "white" : useColorModeValue("gray.700", "gray.200")
                }
                cursor="pointer"
                _hover={{
                  bg: isActive ? bgActiveHover : bgHover,
                }}
                initial="rest"
                animate="rest"
                whileHover="hover"
              >
                {/* Icon ikut animasi parent */}
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0 },
                    hover: { scale: 1.1, rotate: 3 },
                  }}
                  transition={{ type: "tween", stiffness: 300 }}
                >
                  <item.icon size={20} />
                </motion.div>
                {item.label}
              </MotionBox>
            )}
          </NavLink>
        ))}
      </VStack>

      <Spacer />

      {/* Logout */}
      <Button
        onClick={handleLogout}
        w="full"
        justifyContent="flex-start"
        gap={3}
        fontWeight="500"
        colorPalette="red"
        outlineColor={"red.500"}
        variant="outline"
        _hover={{ bg: "red.50" }}
      >
        <LogOut size={20} />
        Logout
      </Button>
    </Flex>
  );
}
