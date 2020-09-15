import {
  Box,
  Button,
  Card,
  Grid,
  Image,
  Input,
  Link,
  NextLink,
  Popup,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "relay-hooks";

import { challengeReasonEnum, ethereumAddressRegExp, zeroAddress } from "data";

const challengeButtonFragments = {
  contract: graphql`
    fragment challengeButtonContract on Contract {
      submissionChallengeBaseDeposit
      sharedStakeMultiplier
    }
  `,
  request: graphql`
    fragment challengeButtonRequest on Request {
      disputed
      arbitrator
      arbitratorExtraData
      usedReasons
      currentReason
    }
  `,
};
function ChallengeTypeCard({ type, setType, currentType, ...rest }) {
  const { imageSrc, startCase, description } = type;
  return (
    <Card
      variant="muted"
      sx={{ width: 182 }}
      mainSx={{ flexDirection: "column", padding: 0 }}
      onClick={() => setType(type)}
      active={type === currentType}
      {...rest}
    >
      <Image sx={{ marginBottom: 2 }} src={imageSrc} />
      <Text sx={{ fontWeight: "bold", marginBottom: 2 }}>{startCase}</Text>
      <Text>{description}</Text>
    </Card>
  );
}
function DuplicateInput({ submissionID, setDuplicate }) {
  const [value, setValue] = useState("");
  const isValidAddress = ethereumAddressRegExp.test(value);
  const [submission] = useContract(
    "proofOfHumanity",
    "getSubmissionInfo",
    useMemo(
      () => ({
        args: [isValidAddress ? value : undefined],
      }),
      [isValidAddress, value]
    )
  );

  let message;
  if (submissionID.toLowerCase() === value.toLowerCase())
    message = "A submission can not be a duplicate of itself.";
  else if (isValidAddress && submission)
    if (Number(submission.status) > 0 || submission.registered)
      message = "Valid duplicate.";
    else
      message =
        "A supposed duplicate should be either registered or pending registration.";
  useEffect(() => {
    if (message === "Valid duplicate.") setDuplicate(value);
    else setDuplicate();
  }, [message, setDuplicate, value]);
  return (
    <Box sx={{ marginBottom: 2 }}>
      <Input
        sx={{ marginBottom: 1 }}
        placeholder="Duplicate Address"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Text>{message}</Text>
      {isValidAddress && (
        <NextLink href="/profile/[id]" as={`/profile/${value}`}>
          <Link newTab>See Profile</Link>
        </NextLink>
      )}
    </Box>
  );
}
export default function ChallengeButton({ request, contract, submissionID }) {
  const {
    currentReason: _currentReason,
    arbitrator,
    arbitratorExtraData,
    disputed,
    usedReasons: _usedReasons,
  } = useFragment(challengeButtonFragments.request, request);
  const currentReason = challengeReasonEnum.parse(_currentReason);
  const usedReasons = challengeReasonEnum.parse(_usedReasons);
  const currentReasonIsNotDuplicate =
    currentReason !== challengeReasonEnum.Duplicate;

  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: arbitrator,
        args: [arbitratorExtraData],
      }),
      [arbitrator, arbitratorExtraData]
    )
  );
  const { web3 } = useWeb3();
  const { sharedStakeMultiplier, submissionChallengeBaseDeposit } = useFragment(
    challengeButtonFragments.contract,
    contract
  );
  const totalCost = arbitrationCost
    ?.add(
      arbitrationCost
        .mul(web3.utils.toBN(sharedStakeMultiplier))
        .div(web3.utils.toBN(10000))
    )
    .add(web3.utils.toBN(submissionChallengeBaseDeposit));

  const [type, setType] = useState();
  const duplicateTypeSelected = type === challengeReasonEnum.Duplicate;
  const [duplicate, setDuplicate] = useState();
  const { send, loading } = useContract("proofOfHumanity", "challengeRequest");
  return (
    <Popup
      contentStyle={{ width: undefined }}
      trigger={
        <Button
          variant="secondary"
          sx={{
            marginY: 1,
            padding: 1,
            width: "100%",
          }}
          disabled={disputed && currentReasonIsNotDuplicate}
        >
          Challenge Request
        </Button>
      }
      modal
    >
      {(close) => (
        <Box sx={{ fontWeight: "bold", padding: 2 }}>
          <Text sx={{ marginBottom: 1 }}>Deposit:</Text>
          <Card
            variant="muted"
            sx={{ fontSize: 2, marginBottom: 3 }}
            mainSx={{ padding: 0 }}
          >
            <Text>
              {totalCost && `${web3.utils.fromWei(totalCost)} ETH Deposit`}
            </Text>
          </Card>
          <Text sx={{ marginBottom: 1 }}>Challenge Type:</Text>
          <Grid sx={{ marginBottom: 2 }} gap={1} columns={[1, 2, 4]}>
            <ChallengeTypeCard
              type={challengeReasonEnum.IncorrectSubmission}
              setType={setType}
              currentType={type}
              disabled={usedReasons.IncorrectSubmission || disputed}
            />
            <ChallengeTypeCard
              type={challengeReasonEnum.Deceased}
              setType={setType}
              currentType={type}
              disabled={usedReasons.Deceased || disputed}
            />
            <ChallengeTypeCard
              type={challengeReasonEnum.Duplicate}
              setType={setType}
              currentType={type}
              disabled={usedReasons.Duplicate && currentReasonIsNotDuplicate}
            />
            <ChallengeTypeCard
              type={challengeReasonEnum.DoesNotExist}
              setType={setType}
              currentType={type}
              disabled={usedReasons.DoesNotExist || disputed}
            />
          </Grid>
          {duplicateTypeSelected && (
            <DuplicateInput
              submissionID={submissionID}
              setDuplicate={setDuplicate}
            />
          )}
          <Button
            sx={{ display: "block", margin: "auto" }}
            disabled={
              !type || (duplicateTypeSelected && !duplicate) || !totalCost
            }
            onClick={() =>
              send(
                submissionID,
                type.index,
                duplicate || zeroAddress,
                zeroAddress,
                { value: totalCost }
              ).then(() => close())
            }
            loading={loading}
          >
            Challenge Request
          </Button>
        </Box>
      )}
    </Popup>
  );
}