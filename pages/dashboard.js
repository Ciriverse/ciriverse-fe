import { Container, Row, Col } from "react-bootstrap";
// import Sidebar from "../components/Sidebar";
// import MessageForm from "../components/MessageForm";

export default function Dashboard() {
  return (
    <section className="dashboard">
      <Container>
        <Row>
          <Col md={4}>{/* <Sidebar /> */}</Col>
          <Col md={8}>{/* <MessageForm /> */}</Col>
        </Row>
      </Container>
    </section>
  );
}
