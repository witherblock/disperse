import {
  erc20ABI,
  useContract,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useProvider,
  useSigner,
  Address,
} from "wagmi";
import { Button } from "@nextui-org/react";

import {
  // permit2 contract address
  PERMIT2_ADDRESS,
  // the type of permit that we need to sign
  // this will help us get domain, types and values that we need to create a signature
  AllowanceTransfer,
  AllowanceProvider,
  MaxUint48,
  AllowanceData,
} from "@uniswap/permit2-sdk";

import disperseAbi from "../constants/abis/disperse";
import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { MaxUint256 } from "@uniswap/permit2-sdk";

const TOKEN_ADDRESS = "0xda5bb55c0eA3f77321A888CA202cb84aE30C6AF5";
const DISPERSE_ADDRESS = "0xC5ac98C06391981A4802A31ca5C62e6c3EfdA48d";

interface PermitSingle {
  details: {
    token: `0x${string}`;
    amount: BigNumber;
    expiration: number;
    nonce: number;
  };
  spender: `0x${string}`;
  sigDeadline: BigNumber;
}

const Send = ({
  tokenAddress,
  transferDetails,
  isNative,
  totalValue,
}: {
  isNative: boolean;
  tokenAddress: `0x${string}`;
  transferDetails: {
    recipients: Address[];
    values: string[];
  };
  totalValue: BigNumber;
}) => {
  const token = useContract({
    address: tokenAddress,
    abi: erc20ABI,
  });

  const [allowanceData, setAllowanceData] = useState<AllowanceData | null>(
    null
  );

  const signer = useSigner();

  const disperse = useContract({
    abi: disperseAbi,
    address: DISPERSE_ADDRESS,
    signerOrProvider: signer.data,
  });

  const provider = useProvider();

  const handleClick = async () => {
    if (!allowanceData) return;

    if (allowanceData.amount.lt(totalValue)) {
      try {
        await token?.approve(PERMIT2_ADDRESS, MaxUint256);
      } catch {
        return;
      }
    }

    const permit: PermitSingle = {
      details: {
        token: tokenAddress,
        amount: BigNumber.from(1),
        expiration: MaxUint48.toNumber(),
        nonce: allowanceData.nonce,
      },
      spender: disperse?.address || "0x",
      sigDeadline: MaxUint48,
    };

    console.log(permit);

    const { domain, types, values } = AllowanceTransfer.getPermitData(
      permit,
      PERMIT2_ADDRESS,
      1337
    );
    //@ts-ignore
    let signature = await signer.data._signTypedData(domain, types, values);

    const fire = await disperse?.disperseSingleWithPermit2(
      tokenAddress,
      transferDetails.recipients,
      transferDetails.values.map((v) => BigNumber.from(v)),
      permit,
      signature
    );
  };

  useEffect(() => {
    async function update() {
      const allowanceProvider = new AllowanceProvider(
        provider,
        PERMIT2_ADDRESS
      );

      const allowanceData = await allowanceProvider.getAllowanceData(
        "0xda5bb55c0eA3f77321A888CA202cb84aE30C6AF5",
        "0xDe485812E28824e542B9c2270B6b8eD9232B7D0b",
        "0xC5ac98C06391981A4802A31ca5C62e6c3EfdA48d"
      );

      setAllowanceData(allowanceData);
    }

    update();
  }, [provider]);

  return (
    <Button color="default" onClick={handleClick}>
      Send
    </Button>
  );
};

export default Send;
