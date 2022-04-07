import { CheckCircleFilled } from "@ant-design/icons";
import { Crowdfund } from "@kleros/icons";
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Image,
  Progress,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import React from "react";
import Video from "react-player";

const { Title, Link, Paragraph } = Typography;

export default class FinalizeTab extends React.Component {
  constructor(props) {
    super(props);
    // console.log('FinalizeTab props=', props);
    this.state = {
      loading: false,
      playedVideo: false,
    };
  }

  handleVideo = () => {
    this.setState({ playedVideo: true });
  };
  handleSubmit = () => {
    this.props.stateHandler({ error: null });
    this.setState({ loading: true });
    this.props.prepareTransaction();
  };
  goToProfile = () => {
    router.push({
      pathname: "/profile/[id]",
      query: { id: this.props.account },
    });
    window.location.reload();
  };
  render() {
    // img, video and submitter name source by props

    return this.props.state.txHash === "" ? (
      <Row>
        <Col span={24}>
          <Title level={2}>Finalize your registration</Title>
          <Paragraph>
            Verify your submission information and media is correct and submit
            the transaction to register
          </Paragraph>
          <Alert
            message={
              <>
                <Title level={5}>Pro tip</Title>
                <Paragraph>
                  People can try to notify you of problems in your submission
                  and save your deposit via your{" "}
                  <Link href="https://ethmail.cc/">ethmail.cc</Link>. Make sure
                  to check it while submission is being processed.
                </Paragraph>
              </>
            }
            style={{ marginBottom: "15px" }}
            closable
            showIcon
          />
          {this.props.state.name && (
            <Row>
              <Title level={4}>Name: {this.props.state.name}</Title>
            </Row>
          )}
          {this.props.account && (
            <Row>
              <Paragraph>Ethereum Address: </Paragraph>
              <Paragraph
                style={{
                  width: "100%",
                  fontWeight: "bold",
                  border: "2px solid #ffb978",
                  borderRadius: "15px",
                  textAlign: "center",
                  margin: "0 auto",
                  padding: "5px",
                }}
              >
                {this.props.account}
              </Paragraph>
            </Row>
          )}
          {this.props.state.bio && (
            <Row>
              <Title level={4}>About me: {this.props.state.bio}</Title>
            </Row>
          )}
          <Row justify="center" align="middle" style={{ marginTop: "5%" }}>
            <Col xl={12} xs={24}>
              {this.props.state.imageURI !== "" ? (
                <Image
                  crossOrigin="anonymous"
                  preview={false}
                  style={{
                    width: "50%",
                    borderRadius: "50%",
                    border: "1px solid black",
                    display: "block",
                    margin: "0 auto",
                  }}
                  src={this.props.state.imageURI}
                />
              ) : (
                <Row justify="center">
                  <Col span={24} style={{ textAlign: "center" }}>
                    <Paragraph>Your picture is loading, please wait.</Paragraph>
                    <Spin />
                  </Col>
                </Row>
              )}
            </Col>
            <Col xl={12} xs={24}>
              {this.props.state.videoURI !== "" ? (
                <>
                  <Video
                    config={{
                      file: {
                        attributes: {
                          crossOrigin: "true",
                        },
                      },
                    }}
                    controls
                    onEnded={(event) => this.handleVideo(event)}
                    style={{ width: "100%" }}
                    width={"100%"}
                    height={"100%"}
                    url={this.props.state.videoURI}
                  />
                  {!this.state.playedVideo && (
                    <Paragraph style={{ textAlign: "center" }}>
                      Please check your whole video to be able to send the
                      submission.
                    </Paragraph>
                  )}
                </>
              ) : (
                <>
                  <Row justify="center">
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Paragraph>Your video is loading, please wait.</Paragraph>
                      <Spin />
                      <Progress
                        percent={Math.round(this.props.state.progress * 100)}
                        status="active"
                      />
                    </Col>
                  </Row>
                </>
              )}
            </Col>
          </Row>
          <Row justify="center">
            <Col span={12} style={{ textAlign: "center" }}>
              <Checkbox
                style={{ fontSize: "large" }}
                onChange={(event) => {
                  this.props.stateHandler({ crowdfund: event.target.checked });
                }}
              >
                I want to use Crowdfund (no self deposit)
              </Checkbox>
            </Col>
          </Row>
          {/* Next steps... */}{" "}
        </Col>
        <Button
          type="primary"
          shape="round"
          className="button-grey"
          onClick={this.props.prev}
        >
          Previous
        </Button>
        <Button
          type="primary"
          disabled={
            this.props.state.videoURI === "" ||
            this.props.state.imageURI === "" ||
            !this.state.playedVideo
          }
          shape="round"
          className="button-orange"
          onClick={this.handleSubmit}
          loading={this.state.loading && this.props.state.error === null}
        >
          Submit profile
        </Button>
      </Row>
    ) : (
      <Row style={{ display: "block", margin: "0 auto" }}>
        <Space direction="vertical">
          <Title level={2}>Your profile is being uploaded!</Title>
          <Title level={4}>
            But it&apos;s not over yet! Here are the next steps before you can
            start receiving UBI.
          </Title>
          <Row justify="center" align="middle">
            <Col span={24}>

              <Title level={5} style={{ display: "block", margin: "0 auto" }}>
                You need at least one existing member to vouch for you.
              </Title>
            </Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>
              <Link
                href="https://t.me/PoHCrowdvoucher"
                target="_blank"
                className="button-orange"
                style={{
                  width: "50%",
                  height: "30%",
                  borderRadius: "25px",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Join the crowdvoucher group on Telegram
              </Link>
            </Col>
          </Row>

          {this.props.state.crowdfund && (
            <>
              <CheckCircleFilled
                style={{ fontSize: "50px", color: "green", marginRight: "20px" }}
              />
              <Row justify="center">
                <Col span={24}>
                  <Crowdfund
                    fill="green"
                    height="50px"
                    width="50px"
                    style={{ marginRight: "20px" }}
                  />
                  <Title level={4} style={{ display: "block", margin: "0 auto" }}>
                    You need to find people who are willing to pay for your
                    deposit.
                  </Title>


                  <Link
                    href="https://t.me/PoHcrowdfunding"
                    target="_blank"
                    className="button-orange"
                    style={{
                      width: "35%",
                      borderRadius: "25px",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    Join the crowdfunding group on Telegram
                  </Link>
                </Col>
              </Row>
            </>
          )}

          {this.props.state.confirmed && (
            <Button
              type="primary"
              shape="round"
              style={{
                fontWeight: "bold",
                display: "block",
                margin: "50px auto",
                backgroundColor: "#ffb978",
                border: "none",
                width: "50%",
                height: "60px",
              }}
              onClick={this.goToProfile}
            >
              Go to my profile now!
            </Button>
          )}
        </Space>
      </Row>
    );
  }
}
