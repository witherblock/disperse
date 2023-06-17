import { useEffect, useState } from "react";
import { erc20ABI, usePublicClient, useWalletClient } from "wagmi";
import { Button } from "@nextui-org/react";
import { getContract, Address } from "viem";

import {
  PERMIT2_ADDRESS,
  AllowanceTransfer,
  AllowanceProvider,
  MaxUint48,
  MaxUint256,
  AllowanceData,
} from "permit2-sdk-viem";

import disperseAbi from "../constants/abis/disperse";

// const TOKEN_ADDRESS = "0xda5bb55c0eA3f77321A888CA202cb84aE30C6AF5";
const DISPERSE_ADDRESS = "0xC5ac98C06391981A4802A31ca5C62e6c3EfdA48d";

interface PermitSingle {
  details: {
    token: `0x${string}`;
    amount: bigint;
    expiration: number;
    nonce: number;
  };
  spender: `0x${string}`;
  sigDeadline: bigint;
}

const Send = ({
  tokenAddress,
  transferDetails,
  // isNative,
  totalValue,
}: {
  isNative: boolean;
  tokenAddress: `0x${string}`;
  transferDetails: {
    recipients: Address[];
    values: string[];
  };
  totalValue: bigint;
}) => {
  const walletClient = useWalletClient();
  const publicClient = usePublicClient();

  const [allowanceData, setAllowanceData] = useState<AllowanceData | null>(
    null
  );

  const handleClick = async () => {
    if (!allowanceData || !walletClient.data) return;

    const token = getContract({
      address: tokenAddress,
      abi: erc20ABI,
      walletClient: walletClient.data,
    });

    if (allowanceData.amount <= totalValue) {
      try {
        await token.write.approve([PERMIT2_ADDRESS as Address, MaxUint256]);
      } catch {
        return;
      }
    }

    const disperse = getContract({
      abi: disperseAbi,
      address: DISPERSE_ADDRESS,
      walletClient: walletClient.data,
    });

    const permit: PermitSingle = {
      details: {
        token: tokenAddress,
        amount: 1n,
        expiration: Number(MaxUint48),
        nonce: allowanceData.nonce,
      },
      spender: disperse?.address || "0x",
      sigDeadline: MaxUint48,
    };

    const { domain, types, values } = AllowanceTransfer.getPermitData(
      permit,
      PERMIT2_ADDRESS,
      1337
    );

    let signature = await walletClient.data.signTypedData({
      domain,
      types,
      //@ts-ignore
      values,
    });

    await disperse.write.disperseSingleWithPermit2([
      tokenAddress,
      transferDetails.recipients,
      transferDetails.values.map((v) => BigInt(v)),
      permit,
      signature,
    ]);
  };

  useEffect(() => {
    async function update() {
      const allowanceProvider = new AllowanceProvider(
        publicClient,
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
  }, [publicClient]);

  return (
    <Button color="default" onClick={handleClick}>
      Send
    </Button>
  );
};

export default Send;
