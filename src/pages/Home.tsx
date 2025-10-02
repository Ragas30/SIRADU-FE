import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatHelpText,
  Heading,
  StatValueText,
} from "@chakra-ui/react";

const stats = [
  { label: "Users", value: "1,245", help: "↑ 20% this month" },
  { label: "Revenue", value: "$12,450", help: "↑ 15% this month" },
  { label: "Orders", value: "320", help: "↓ 5% this month" },
];

export default function Dashboard() {
  return (
    <Box>
      <Heading size="md" mb={6}>
        Overview
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        {stats.map((s) => (
          <Stat.Root
            key={s.label}
            p={4}
            shadow="sm"
            rounded="md"
            bg="white"
            _dark={{ bg: "gray.800" }}
          >
            <StatLabel>{s.label}</StatLabel>
            <StatValueText>{s.value}</StatValueText>
            <StatHelpText>{s.help}</StatHelpText>
          </Stat.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
}
