import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "./ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Flex>
      <Sidebar />
      <Box
        ml="260px" // ✅ selaras dengan lebar Sidebar
        flex="1"
        minH="100vh"
        bg="gray.50"
        _dark={{ bg: "gray.900" }}
        transition="margin 0.2s ease"
      >
        <Header />
        <Box p={6}>
          <Toaster />
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
