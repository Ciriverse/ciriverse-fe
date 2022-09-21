import React from "react";
import { useState, useEffect } from "react";
import { Nav, Navbar, Container, Button, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
// import { useSignMessage } from "wagmi";
// moralis
import { useMoralis } from "react-moralis";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

export default function Navigation() {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  // const { signMessageAsync } = useSignMessage();

  // moralis hook declaration
  const {
    enableWeb3,
    isWeb3Enabled,
    isWeb3EnableLoading,
    account,
    Moralis,
    chainId,
    deactivateWeb3,
  } = useMoralis();

  useEffect(() => {
    if (
      !isWeb3Enabled &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("connected")
    ) {
      enableWeb3();
      // enableWeb3({provider: window.localStorage.getItem("connected")}) // add walletconnect
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null Account found");
      }
    });
  }, []);

  useEffect(() => {
    if (account) {
      const connectToMoralis = async () => {
        const userData = {
          address: account,
          chain: chainId,
          network: "evm",
        };
        console.log(userData);
        // making a post request to our 'request-message' endpoint
        const { data } = await axios.post(
          "/api/auth/request-message",
          userData,
          {
            headers: {
              "content-type": "application/json",
            },
          }
        );
        const message = data.message;

        console.log(message);
      };
      connectToMoralis();
    }
  }, [account]);

  async function handleLogout(e) {
    e.preventDefault();
    //   await logoutUser(user);
    // redirect to home page
    window.location.replace("/");
  }

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onUpdateActiveLink = (value) => {
    setActiveLink(value);

    if (value.length) {
      const element = document.getElementById(value.substring(1));
      if (element) {
        element.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <Navbar expand="md" className={scrolled ? "scrolled" : ""}>
      <Container>
        <Link href="/#">
          <a className="navbar-brand">
            <Navbar.Brand
              // className="test"
              onClick={() => onUpdateActiveLink("#")}
            >
              <img
                src="/static/images/logo-ciri-white-nobg.png"
                alt="Logo"
                style={{ width: 50, height: 50, marginRight: 10 }}
              />{" "}
              Ciriverse
            </Navbar.Brand>
          </a>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <span className="navbar-toggler-icon"> </span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!account && (
              <>
                <Link href="#how-it-works">
                  <a
                    className={
                      activeLink === "#how-it-works"
                        ? "active nav-link navbar-link"
                        : "nav-link navbar-link"
                    }
                    onClick={() => onUpdateActiveLink("#how-it-works")}
                  >
                    How It Works
                  </a>
                </Link>

                <Link href="#why-ciri">
                  <a
                    className={
                      activeLink === "#why-ciri"
                        ? "active nav-link navbar-link"
                        : "nav-link navbar-link"
                    }
                    onClick={() => onUpdateActiveLink("#why-ciri")}
                  >
                    Why Ciri
                  </a>
                </Link>
              </>
            )}
            {account && (
              <>
                <Link href="/dashboard">
                  <a
                    className={
                      activeLink === "dashboard"
                        ? "active nav-link navbar-link"
                        : "nav-link navbar-link"
                    }
                    onClick={() => onUpdateActiveLink("dashboard")}
                  >
                    Dashboard
                  </a>
                </Link>

                <Link href="/explore">
                  <a
                    className={
                      activeLink === "explore"
                        ? "active nav-link navbar-link"
                        : "nav-link navbar-link"
                    }
                    onClick={() => onUpdateActiveLink("explore")}
                  >
                    Explore
                  </a>
                </Link>
              </>
            )}
            <span className="navbar-text">
              {/* <div className="social-icon">
                  <a href="#"><img src={navIcon1} alt="" /></a>
                  <a href="#"><img src={navIcon2} alt="" /></a>
                  <a href="#"><img src={navIcon3} alt="" /></a>
                </div> */}

              <button
                className="vvd"
                onClick={async () => {
                  // await walletModal.connect()
                  const ret = await enableWeb3();
                  if (typeof ret !== "undefined") {
                    // depends on what button they picked
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem("connected", "injected");
                      // window.localStorage.setItem("connected", "walletconnect")
                    }
                    console.log(ret);

                    router.push("/dashboard");
                  }
                }}
                disabled={isWeb3EnableLoading}
              >
                <span>
                  {account
                    ? `${account.slice(0, 6)}...
                              ${account.slice(account.length - 4)}`
                    : isWeb3EnableLoading
                    ? `Connecting..`
                    : `Let’s Connect`}
                </span>
              </button>
            </span>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
