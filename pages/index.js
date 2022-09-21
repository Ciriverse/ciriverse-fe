import Head from "next/head";
import Image from "next/image";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";

import WhyCiri from "../components/WhyCiri";
import { useMoralis } from "react-moralis";

// moralis hook declaration

export default function Home() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <WhyCiri />
      <Footer />
    </div>
  );
}
