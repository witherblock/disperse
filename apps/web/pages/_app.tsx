import * as React from "react";
import type { AppProps } from "next/app";
import { createTheme, CssBaseline, NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import "@rainbow-me/rainbowkit/styles.css";

const nextUiLightTheme = createTheme({
  type: "light",
});

const nextUiDarkTheme = createTheme({
  type: "dark",
});

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, localhost],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "disperse.xyz",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function App({ Component }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
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
            {CssBaseline.flush()}
            <Component />
          </NextUIProvider>
        </NextThemesProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
