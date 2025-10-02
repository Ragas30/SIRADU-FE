import {
  Flex,
  IconButton,
  Spacer,
  Avatar,
  Text,
  HStack,
  Menu,
  MenuItem,
  Box,
  MenuRoot,
} from "@chakra-ui/react";
import { FiSun, FiMoon, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { useColorMode, useColorModeValue } from "./ui/color-mode";

export default function Header({ header }: { header?: string }) {
  const { colorMode, toggleColorMode } = useColorMode();
  header = header || "SIRADU";

  return (
    <Flex
      as="header"
      px={6}
      py={3}
      align="center"
      bg={useColorModeValue("white", "gray.800")}
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      pos="sticky"
      top={0}
      zIndex={10}
    >
      {/* Judul halaman */}
      <Text
        fontWeight="bold"
        fontSize="lg"
        color={useColorModeValue("gray.800", "gray.100")}
      >
        {header}
      </Text>

      <Spacer />

      {/* Aksi kanan */}
      <HStack gap={3}>
        {/* Toggle theme */}
        <IconButton
          aria-label="toggle theme"
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
          _hover={{
            bg: useColorModeValue("gray.100", "gray.700"),
          }}
          _icon={{
            color: useColorModeValue("gray.800", "gray.100"),
          }}
        >
          {colorMode === "light" ? <FiMoon /> : <FiSun />}
        </IconButton>

        {/* Avatar + Menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <Box as="button" borderRadius="full" overflow="hidden">
              <Avatar.Root>
                <Avatar.Fallback name="Rizki Mufid" />
                {/* <Avatar.Image src="https://bit.ly/sage-adebayo" /> */}
              </Avatar.Root>
            </Box>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="profile">
                <FiUser />
                Profile
              </Menu.Item>

              <Menu.ItemGroup>
                <Menu.Item value="settings">
                  <FiSettings />
                  Settings
                </Menu.Item>
              </Menu.ItemGroup>

              <Menu.Separator />
              <Menu.Arrow />

              <Menu.CheckboxItem
                value="darkMode"
                checked={colorMode === "dark"}
                onChange={toggleColorMode}
              >
                Dark Mode
                <Menu.ItemIndicator />
              </Menu.CheckboxItem>

              <Menu.RadioItemGroup>
                <Menu.RadioItem value="logout">
                  <Menu.ItemIndicator />
                  Logout
                </Menu.RadioItem>
              </Menu.RadioItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </HStack>
    </Flex>
  );
}
