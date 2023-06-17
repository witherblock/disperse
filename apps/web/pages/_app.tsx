import * as React from "react";
import type { AppProps } from "next/app";
import { createTheme, NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import "@rainbow-me/rainbowkit/styles.css";

const nextUiLightTheme = createTheme({
  type: "light",
});

const nextUiDarkTheme = createTheme({
  type: "dark",
});

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
        <NextThemesProvider
          defaultTheme="dark"
          attribute="class"
          value={{
            light: nextUiLightTheme.className,
            dark: nextUiDarkTheme.className,
          }}
        >
          <NextUIProvider>
            <Component />
          </NextUIProvider>
        </NextThemesProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
