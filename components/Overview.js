import { Container, Row, Col, Tab, Nav, Card, Button } from "react-bootstrap";

import "animate.css";

import { create as ipfsHttpClient } from "ipfs-http-client";

import { useMoralis, useWeb3Contract } from "react-moralis";
import milestoneAbi from "../constants/MilestoneNFTv2.json";
import { useEffect, useState } from "react";
import { utils } from "ethers";
import Loader from "./Loader";

export default function Overview() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const [funds, setFunds] = useState("0");
  const [donatorsCount, setdonatorsCount] = useState("0");
  const [milestones, setMilestones] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isWithdrawing, setWithdrawing] = useState(false);

  const milestoneAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const { runContractFunction: getFunds } = useWeb3Contract({
    abi: milestoneAbi,
    contractAddress: milestoneAddress,
    functionName: "getFunds",
    params: {
      creator: account,
    },
  });

  const { runContractFunction: getDonatorsCount } = useWeb3Contract({
    abi: milestoneAbi,
    contractAddress: milestoneAddress,
    functionName: "getDonatorsCount",
    params: {
      creator: account,
    },
  });

  const { runContractFunction: getMilestones } = useWeb3Contract({
    abi: milestoneAbi,
    contractAddress: milestoneAddress,
    functionName: "getMilestones",
    params: {
      creator: account,
    },
  });

  const { runContractFunction: withdrawFund } = useWeb3Contract({
    abi: milestoneAbi,
    contractAddress: milestoneAddress,
    functionName: "withdrawFunds",
    onError: (error) => setWithdrawing(false),
    onSuccess: async (success) => {
      await success.wait(1);
      updateMilestones();
      setWithdrawing(false);
      updateFunds();
    },
  });

  async function updateFunds() {
    let fundsData = await getFunds();
    fundsData = utils.formatUnits(fundsData, "ether");

    setFunds(fundsData);
  }

  async function updateDonatorsCount() {
    let donatorsData = await getDonatorsCount();
    donatorsData = donatorsData.toString();
    setdonatorsCount(donatorsData);
  }

  async function updateMilestones() {
    setIsFetching(true);
    let milestonesData = await getMilestones();

    let dataAfter = [];

    await Promise.all(
      milestonesData.map(async (data, index) => {
        let tokenURIResponse = await (await fetch(data)).json();

        dataAfter.push(tokenURIResponse);
      })
    );

    setMilestones(dataAfter);
    setIsFetching(false);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateFunds();
      updateDonatorsCount();
      updateMilestones();
    }
  }, [isWeb3Enabled, account]);

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
            <h4 className="pb-2">Withdraw</h4>
            <h2 className="pb-2">{funds} Klay</h2>
            <span className=" navbar-text justify-content-center">
              <button
                disabled={isWithdrawing}
                onClick={async () => {
                  setWithdrawing(true);
                  await withdrawFund();
                }}
                className="vvd shadow-md"
              >
                <span>{isWithdrawing ? "Withdrawing.." : "Withdraw"}</span>
              </button>
            </span>
          </Col>
          <Col
            style={{
              background:
                "linear-gradient(90.21deg,rgba(170, 54, 124, 0.5) -5.91%,rgba(74, 47, 189, 0.5) 111.58%)",
            }}
            className="border border-white p-3 m-3 shadow-lg"
          >
            <h4 className="pb-3">Total Supporters</h4>
            <h2>{donatorsCount}</h2>
            <h3>Supportes</h3>
          </Col>
        </Row>
        <Row className="text-center">
          <Col
            style={{
              background:
                "linear-gradient(90.21deg,rgba(170, 54, 124, 0.5) -5.91%,rgba(74, 47, 189, 0.5) 111.58%)",
            }}
            className="border border-white p-3 m-3 shadow-lg"
          >
            <h4>Milestones</h4>
            <Row className="p-4 justify-content-center text-black">
              {isFetching ? (
                <div className="justify-content-center">
                  <Loader />
                </div>
              ) : milestones.length > 0 ? (
                milestones.map((tokenURIResponse) => {
                  return (
                    <Card
                      className="m-3 justify-content-center shadow-lg"
                      style={{ width: "18rem" }}
                    >
                      <div className="pt-4 justify-content-center">
                        <Card.Img
                          style={{
                            objectFit: "cover",
                            height: "300px",
                            width: "15rem",
                          }}
                          src={tokenURIResponse.image}
                        />
                      </div>

                      <Card.Body>
                        <Card.Title>{tokenURIResponse.name}</Card.Title>
                        <Card.Text
                          style={{
                            height: "75px",
                          }}
                        >
                          {text_truncate(tokenURIResponse.description, 65)}{" "}
                          <br></br> ({tokenURIResponse.price} Klay).
                        </Card.Text>
                        <div>
                          <Button
                            onClick={() =>
                              window.open(
                                `https://testnets.opensea.io/collection/ciriverse-v2`,
                                "_blank"
                              )
                            }
                            variant="primary"
                          >
                            <img
                              src="/static/images/opensea.svg"
                              style={{
                                objectFit: "cover",
                                height: "25px",
                                width: "25px",
                                marginRight: "5px",
                              }}
                            ></img>
                            Open Sea
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })
              ) : (
                <div className="text-white">
                  <img
                    className="w-50"
                    src="/static/images/cat-img-2.svg"
                  ></img>
                  <h3>You haven't setup Milestones NFT</h3>
                  <br />
                </div>
              )}
              {/* <Card className="m-3" style={{ width: "18rem" }}>
                <Card.Img variant="top" src="/static/images/cat-img-2.svg" />
                <Card.Body>
                  <Card.Title>NFT Name</Card.Title>
                  <Card.Text>
                    70% Reach this milestone <br></br> (20 Klay).
                  </Card.Text>
                  <Button variant="primary">Open Sea</Button>
                </Card.Body>
              </Card>
              <Card className="m-3" style={{ width: "18rem" }}>
                <Card.Img variant="top" src="/static/images/cat-img-2.svg" />
                <Card.Body>
                  <Card.Title>NFT Name</Card.Title>
                  <Card.Text>
                    70% Reach this milestone <br></br> (20 Klay).
                  </Card.Text>
                  <Button variant="primary">Open Sea</Button>
                </Card.Body>
              </Card>
              <Card className="m-3" style={{ width: "18rem" }}>
                <Card.Img variant="top" src="/static/images/cat-img-2.svg" />
                <Card.Body>
                  <Card.Title>NFT Name</Card.Title>
                  <Card.Text>
                    70% Reach this milestone <br></br> (20 Klay).
                  </Card.Text>
                  <Button variant="primary">Open Sea</Button>
                </Card.Body>
              </Card>
              <Card className="m-3" style={{ width: "18rem" }}>
                <Card.Img variant="top" src="/static/images/cat-img-2.svg" />
                <Card.Body>
                  <Card.Title>NFT Name</Card.Title>
                  <Card.Text>
                    70% Reach this milestone <br></br> (20 Klay).
                  </Card.Text>
                  <Button variant="primary">Open Sea</Button>
                </Card.Body>
              </Card>
              <Card className="m-3" style={{ width: "18rem" }}>
                <Card.Img variant="top" src="/static/images/cat-img-2.svg" />
                <Card.Body>
                  <Card.Title>NFT Name</Card.Title>
                  <Card.Text>
                    70% Reach this milestone <br></br> (20 Klay).
                  </Card.Text>
                  <Button variant="primary">Open Sea</Button>
                </Card.Body>
              </Card> */}
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
