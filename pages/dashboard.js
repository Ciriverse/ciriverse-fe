import { Container, Row, Col, ListGroup } from "react-bootstrap";
import Head from "next/head";
// import Sidebar from "../components/Sidebar";
// import MessageForm from "../components/MessageForm";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import nftAbi from "../constants/MilestoneNFT.json";
import milestoneAbi from "../constants/MilestoneNFTv2.json";
import { useEffect, useState } from "react";
import Mint from "../components/Mint";
import Overview from "../components/Overview";
import MilestoneNFT from "../components/MilestoneNFT";
import { PlusCircle } from "react-bootstrap-icons";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Overlays from "../components/Overlays";

const projectId = "2FAORjlGKnlM2unSmMNIsLKGnjX";
const projectSecret = "7dfd99f8cf8a0583c9830a141c2bed1c";
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

const client = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});

export default function Dashboard() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = "31337";
  const { runContractFunction } = useWeb3Contract();
  const milestoneAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const [data, setData] = useState([]);
  const [currentPage, setPage] = useState("Overview");
  const [creatorStatus, setCreator] = useState(false);
  const [fileUrl, setFileUrl] = useState(
    "https://ipfs.io/ipfs/QmV1RmdU9TXVztvdBcUPe5v2qfQWL5pfxbrGuipiwUUAJW"
  );
  const [isUploading, setUploading] = useState(false);
  const [isRegistering, setRegistering] = useState(false);
  const [formInput, updateFormInput] = useState({
    name: "",
    // tags: [
    //   { id: 'NFT', text: 'NFT' },
    //   { id: 'Chiq', text: 'Chiq' },
    // ]
  });

  async function onUpload(e) {
    const file = e.target.files[0];
    console.log("masuk sini");
    setUploading(true);
    console.log(file);
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file:", error);
    }
    setUploading(false);
  }

  const { runContractFunction: seeRegister } = useWeb3Contract({
    abi: milestoneAbi,
    contractAddress: milestoneAddress,
    functionName: "getCreator",
    params: {
      creator: account,
    },
  });

  const { runContractFunction: isCreator } = useWeb3Contract({
    abi: milestoneAbi,
    contractAddress: milestoneAddress,
    functionName: "isCreator",
    // params: {
    //   creator: account,
    // },
  });

  async function updateUI() {
    let dataCreator = await isCreator();
    console.log("Creator bukan");
    console.log(dataCreator);
    setCreator(dataCreator);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, account]);

  return (
    <section className="dashboard">
      <Head>
        <title>Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container fluid>
        <Row>
          <Col md={3}>
            {/* <button className="underline">Overview</button>
            <button
              className="text-transparent rounded p-4 shadow-lg bg-white"
              onClick={() => {
                updateUI();
              }}
            >
              Update UI
            </button>
            <Mint /> */}
            <span className="navbar-text">
              <button
                onClick={() => {
                  setPage("Overview");
                }}
                className="vvd shadow-lg w-50 mb-3"
              >
                <span>Overview</span>
              </button>
            </span>
            <span className="navbar-text">
              <button
                onClick={() => {
                  setPage("Milestone NFTs");
                }}
                className="vvd shadow-lg w-50 mb-3"
              >
                <span>Milestone NFTs</span>
              </button>
            </span>
            <span className="navbar-text">
              <button
                onClick={() => {
                  setPage("Collectible NFTs");
                }}
                className="vvd shadow-lg w-50 mb-3"
              >
                <span>Collectible NFTs</span>
              </button>
            </span>
            <span className="navbar-text">
              <button
                onClick={() => {
                  setPage("Overlays");
                }}
                className="vvd shadow-lg w-50 mb-3"
              >
                <span>Overlays</span>
              </button>
            </span>
          </Col>
          <Col md={8}>
            {/* <MessageForm /> */}
            {/* <button
              onClick={() => {
                runContractFunction({
                  params: {
                    abi: milestoneAbi,
                    contractAddress: milestoneAddress,
                    functionName: "creatorRegister",
                    params: { name: "test2", pic: "test2" },
                  },
                  onError: (error) => console.log(error),
                  onSuccess: (success) => {
                    console.log(success);
                    updateUI();
                  },
                });
              }}
            >
              
            </button> */}
            {creatorStatus ? (
              currentPage == "Overview" ? (
                <Overview />
              ) : currentPage == "Milestone NFTs" ? (
                <MilestoneNFT />
              ) : currentPage == "Overlays" ? (
                <Overlays />
              ) : (
                "Coming Soon"
              )
            ) : (
              <div className="text-center justify-content-center">
                <br />
                <p className="">
                  You are not Register as Creator, Click the button to register{" "}
                </p>
                <br />
                <div className="signup-profile-pic__container">
                  <img
                    src={fileUrl || "/static/images/cat-img-2.svg"}
                    className="signup-profile-pic"
                  />
                  <label htmlFor="image-upload" className="image-upload-label">
                    <i className="add-picture-icon">
                      {" "}
                      <PlusCircle size={25} />
                    </i>
                  </label>
                  <input
                    disabled={isUploading}
                    type="file"
                    id="image-upload"
                    hidden
                    accept="image/png, image/jpeg"
                    onChange={onUpload}
                  />
                </div>
                <br />
                <div className="justify-content-center">
                  <input
                    placeholder="Your Name"
                    value={formInput.name}
                    className="mt-8 border rounded p-4 w-25"
                    onChange={(e) =>
                      updateFormInput({ ...formInput, name: e.target.value })
                    }
                  />
                  <br />

                  {/* <br /> */}
                  {/* <input
                    type="file"
                    name="Asset"
                    width="350px"
                    className="mt-8 justify-content-center w-25"
                    onChange={onUpload}
                  />{" "}
                  <br />
                  {fileUrl && (
                    <img className="rounded mt-4" width="350px" src={fileUrl} />
                  )} */}
                  <br />
                </div>
                <span className=" navbar-text justify-content-center">
                  <button
                    disabled={creatorStatus || isUploading || isRegistering}
                    onClick={async () => {
                      if (!formInput.name || !fileUrl) return;
                      setRegistering(true);
                      await runContractFunction({
                        params: {
                          abi: milestoneAbi,
                          contractAddress: milestoneAddress,
                          functionName: "creatorRegister",
                          params: {
                            _name: `${formInput.name}`,
                            _pic: `${fileUrl}`,
                          },
                        },
                        onError: (error) => console.log(error),
                        onSuccess: async (success) => {
                          await success.wait(1);
                          console.log(success);
                          setRegistering(false);
                          updateUI();
                        },
                        // onComplete: async (complete) => {
                        //   await complete.wait(1);
                        //   console.log("complete nih");
                        //   updateUI();
                        // },
                      });
                    }}
                  >
                    {isUploading
                      ? "Uploading..."
                      : isRegistering
                      ? "Registering..."
                      : creatorStatus
                      ? "Registered"
                      : "Register"}
                  </button>
                </span>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
