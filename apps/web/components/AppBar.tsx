import { Button, Navbar, Text } from "@nextui-org/react";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function AppBar() {
  return (
    <Navbar isBordered variant="sticky">
      <Navbar.Brand>
        <Text b color="inherit" hideIn="xs">
          Disperse
        </Text>
      </Navbar.Brand>
      <Navbar.Content>
        <Navbar.Item>
          <ConnectButton />
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}
