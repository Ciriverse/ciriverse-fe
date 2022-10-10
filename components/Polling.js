import {
  Container,
  Row,
  Col,
  Tab,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";

import "animate.css";
import TrackVisibility from "react-on-screen";
import { useState, useEffect } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import milestoneAbi from "../constants/MilestoneNFTv2.json";
import collectibleAbi from "../constants/CollectibleNFT.json";
import daoAbi from "../constants/CiriverseDAO.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { utils } from "ethers";
import Loader from "./Loader";

const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

const client = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});

export default function Polling() {
  const [showModal, setShowModal] = useState(false);

  const { chainId, account, isWeb3Enabled } = useMoralis();

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const [isMinting, setIsMinting] = useState(false);
  const [isExecuting, setExecuting] = useState(false);
  // file to upload
  const [fileUrl, setFileUrl] = useState(null);
  const [isUploading, setUploading] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [collectibles, setCollectibles] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [formInput, updateFormInput] = useState({
    option1: "",
    option2: "",
    // tags: [
    //   { id: 'NFT', text: 'NFT' },
    //   { id: 'Chiq', text: 'Chiq' },
    // ]
  });

  const milestoneAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const collectibleAddress =
    process.env.NEXT_PUBLIC_COLLECTIBLE_CONTRACT_ADDRESS;
  const daoAddress = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS;
  const { runContractFunction } = useWeb3Contract();

  const { runContractFunction: getNumProposals } = useWeb3Contract({
    abi: daoAbi,
    contractAddress: daoAddress,
    functionName: "getNumProposals",
    params: {
      creator: account,
    },
    onError: (error) => {},
  });

  function text_truncate(str, length, ending) {
    if (length == null) {
      length = 100;
    }
    if (ending == null) {
      ending = "...";
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  }

  async function updatePollings() {
    setIsFetching(true);
    let num = await getNumProposals();

    let dataAfter = [];

    for (let i = 0; i < num; i++) {
      let data = await runContractFunction({
        params: {
          abi: daoAbi,
          contractAddress: daoAddress,
          functionName: "s_proposals",
          params: {
            creator: account,
            index: i,
          },
        },
        onError: (error) => {},
        onSuccess: async (success) => {},
      });
      dataAfter.push(data);
    }

    setCollectibles(dataAfter);
    setIsFetching(false);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updatePollings();
    }
  }, [isWeb3Enabled, account]);

  async function createPollings() {
    const { option1, option2 } = formInput;

    if (!option1 || !option2) return;

    try {
      createProposal(option1, option2);
    } catch (error) {}
  }

  async function createProposal(option1, option2) {
    // create the items and list them on the marketplace

    setIsMinting(true);

    // we want to create the token
    try {
      // transaction = await contract.makeMarketItem(nftaddress, tokenId, price, {value: listingPrice})
      // await transaction.wait()

      runContractFunction({
        params: {
          abi: daoAbi,
          contractAddress: daoAddress,
          functionName: "createProposal",
          params: { _option1: option1, _option2: option2 },
        },
        onError: (error) => setIsMinting(false),
        onSuccess: async (success) => {
          await success.wait(1);
          updatePollings();
          setIsMinting(false);
          //   updateUI();
        },
      });

      // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
    } catch {
      setIsMinting(false);
    }

    // list the item for sale on the marketplace
  }

  return (
    <section>
      <Container fluid>
        <Row className="text-center">
          <Col
            style={{
              background:
                "linear-gradient(90.21deg,rgba(170, 54, 124, 0.5) -5.91%,rgba(74, 47, 189, 0.5) 111.58%)",
            }}
            className="border border-white p-3 m-3 shadow-lg"
          >
            <h4>Pollings</h4>
            <Row className="p-4 justify-content-center text-black">
              {isFetching ? (
                <div className="justify-content-center">
                  <Loader />
                </div>
              ) : collectibles.length > 0 ? (
                collectibles.map((data, i) => {
                  let deadline = new Date(
                    parseInt(data.deadline.toString()) * 1000
                  );
                  let isOngoing = deadline.getTime() > Date.now();
                  return (
                    <div
                      key={i}
                      className="w-50 card p-4 m-2 justify-content-center shadow-lg"
                    >
                      <div className="d-flex justify-content-end">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `http://localhost:3000/polling?addr=${account}&id=${i}`
                            );
                          }}
                          variant="outline-primary"
                        >
                          Copy Link
                        </Button>
                      </div>

                      <h3 className="pb-3">
                        {isOngoing ? "Ongoing" : "Expired"}
                      </h3>
                      <p className="p-1">
                        {`(${data.votesOpt1} Votes) -  ` + data["option1"]}
                      </p>
                      <h5 className="p-2">OR</h5>
                      <p className="p-1">
                        {`(${data.votesOpt2} Votes) -  ` + data.option2}
                      </p>
                      <h4 className="p-1">
                        {data.executed
                          ? `Result : ${data.result}`
                          : deadline.toLocaleString()}
                      </h4>
                      <Button
                        disabled={isOngoing || isExecuting || data.executed}
                        variant="primary"
                        className="p-2 mt-3"
                        onClick={async () => {
                          setExecuting(true);
                          runContractFunction({
                            params: {
                              abi: daoAbi,
                              contractAddress: daoAddress,
                              functionName: "executeProposal",
                              params: { creator: account, proposalIndex: i },
                            },
                            onError: (error) => setIsMinting(false),
                            onSuccess: async (success) => {
                              await success.wait(1);
                              updatePollings();
                              setExecuting(false);
                              //   updateUI();
                            },
                          });
                        }}
                      >
                        {isExecuting ? "Executing.." : "Execute"}
                      </Button>
                      {/* <div>
                        <div>
                          <input
                            type="radio"
                            id={"test" + "-" + "1"}
                            name={"test"}
                            value={"test"}
                            //default the "abstain" vote to checked
                            defaultChecked={true}
                          />
                          <label htmlFor={"test" + "-" + "1"}>
                            <h5>Test</h5>
                          </label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id={"test" + "-" + "1"}
                            name={"test"}
                            value={"test"}
                            //default the "abstain" vote to checked
                            defaultChecked={false}
                          />
                          <label htmlFor={"test" + "-" + "1"}>{"test 2"}</label>
                        </div>
                      </div> */}
                    </div>
                  );
                })
              ) : (
                <div className="text-white">
                  <img
                    className="w-50"
                    src="/static/images/cat-img-2.svg"
                  ></img>
                  <h3>You haven't setup any Polling</h3>
                  <br />
                </div>
              )}
            </Row>
          </Col>
        </Row>
        <span className="navbar-text">
          <button
            disabled={isMinting}
            onClick={() => {
              handleShowModal();
            }}
            className="vvd shadow-lg"
          >
            <span>{isMinting ? "Submitting..." : "Add Polling"}</span>
          </button>
        </span>
      </Container>

      <Modal
        style={{ zIndex: "9999" }}
        show={showModal}
        onHide={() => {
          handleCloseModal();
          setIsMinting(false);
        }}
        className="text-black"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Pollings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="justify-content-center">
          <div className="justify-content-center ">
            <textarea
              placeholder="Option 1"
              className="mt-2 border rounded p-4 w-100"
              value={formInput.option1}
              onChange={(e) => {
                updateFormInput({ ...formInput, option1: e.target.value });
              }}
            />
            <br />
            <textarea
              placeholder="Option 2"
              className="mt-2 border rounded p-4 w-100"
              value={formInput.option2}
              onChange={(e) => {
                updateFormInput({ ...formInput, option2: e.target.value });
              }}
            />
            <br />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            disabled={isMinting}
            variant="primary"
            onClick={async () => {
              await createPollings();
              handleCloseModal();
            }}
          >
            {isMinting ? "Creating.." : "Create Polling"}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
