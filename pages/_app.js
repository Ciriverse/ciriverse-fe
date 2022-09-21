import "../styles/globals.css";

import { useState } from "react";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "@web3uikit/core";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navigation";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Navbar />
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
