import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Field,
  FieldLabel,
  FieldHelperText,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { uiToast } from "@/components/ui/uiToast";
import { FiUser, FiLock, FiLogIn } from "react-icons/fi";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      uiToast.success("Login berhasil, selamat datang!");
      navigate("/dashboard");
    } catch (err: any) {
      uiToast.error("Login gagal, periksa kembali username & password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, blue.500, purple.600)"
      px={4}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        p={10}
        rounded="2xl"
        shadow="xl"
        w="full"
        maxW="md"
      >
        <Heading size="lg" mb={2} textAlign="center" color="blue.600">
          Welcome Back 👋
        </Heading>
        <Text fontSize="sm" mb={8} textAlign="center" color="gray.500">
          Silakan masuk ke dashboard admin
        </Text>

        {/* Username */}
        {/* Username */}
        <Field.Root required mb={4} w="full">
          <FieldLabel>Username</FieldLabel>

          <Flex
            align="center"
            bg="gray.50"
            rounded="md"
            border="1px solid"
            borderColor="gray.200"
            _focusWithin={{ borderColor: "blue.500", bg: "white" }}
            w="full" // ✅ pastikan flex wrapper full width
          >
            <Box
              w="40px"
              h="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.400"
            >
              <FiUser />
            </Box>
            <Input
              flex="1" // ✅ biar isi penuh
              border="none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              _focus={{ boxShadow: "none" }}
            />
          </Flex>
          <FieldHelperText>Gunakan akun admin/admin123</FieldHelperText>
        </Field.Root>

        {/* Password */}
        <Field.Root required mb={6} w="full">
          <FieldLabel>Password</FieldLabel>
          <Flex
            align="center"
            bg="gray.50"
            rounded="md"
            border="1px solid"
            borderColor="gray.200"
            _focusWithin={{ borderColor: "blue.500", bg: "white" }}
            w="full" // ✅ pastikan flex wrapper full width
          >
            <Box
              w="40px"
              h="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.400"
            >
              <FiLock />
            </Box>
            <Input
              flex="1"
              border="none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              _focus={{ boxShadow: "none" }}
            />
          </Flex>
        </Field.Root>

        {/* Login button */}
        <Button
          type="submit"
          colorScheme="blue"
          w="full"
          size="lg"
          loading={loading}
          loadingText="Logging in..."
          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          transition="all 0.2s"
          mb={4}
        >
          <FiLogIn />
          Login
        </Button>

        {/* Extra link */}
        <Text fontSize="sm" textAlign="center" color="gray.500">
          Lupa password?{" "}
          <Box as="a" color="blue.600" fontWeight="semibold">
            Reset disini
          </Box>
        </Text>
      </Box>
    </Flex>
  );
}
