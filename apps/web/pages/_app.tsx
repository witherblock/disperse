import * as React from "react";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import "../styles/global.css";
import "@rainbow-me/rainbowkit/styles.css";

const { chains, publicClient } = configureChains(
  [localhost, mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "disperse",
  projectId: "disperse",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App({ Component }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme()}
        showRecentTransactions={true}
      >
        <NextUIProvider>
          <main className="dark text-foreground bg-background">
            <Component />
          </main>
        </NextUIProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
