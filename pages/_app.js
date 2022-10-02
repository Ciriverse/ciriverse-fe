import "../styles/globals.css";

import { useState } from "react";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "@web3uikit/core";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navigation";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const showHeader =
    router.pathname === "/notification" || router.pathname === "/qrlink"
      ? false
      : true;

  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        {showHeader && <Navbar />}
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
