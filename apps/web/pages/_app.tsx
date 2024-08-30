import * as React from "react";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { http, WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, localhost } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WALLET_CONNECT_PROJECT_ID } from "../constants/env";

import "@rainbow-me/rainbowkit/styles.css";
import "../styles/global.css";

const config = getDefaultConfig({
  appName: "disperse",
  projectId: WALLET_CONNECT_PROJECT_ID || "",
  chains: [localhost, mainnet, polygon, optimism, arbitrum],
  transports: {
    [localhost.id]: http("http://localhost:8545"),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});

const queryClient = new QueryClient();

function App({ Component }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider theme={darkTheme()} showRecentTransactions={true}>
          <NextUIProvider>
            <main className="dark text-foreground bg-background">
              <Component />
            </main>
          </NextUIProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
