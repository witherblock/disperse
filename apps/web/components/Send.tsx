import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";
import { Button } from "@nextui-org/react";
import { getContract, Address, erc20Abi, parseUnits } from "viem";

import {
  PERMIT2_ADDRESS,
  AllowanceTransfer,
  AllowanceProvider,
  MaxUint48,
  MaxUint256,
  AllowanceData,
} from "permit2-sdk-viem";

import disperseAbi from "../constants/abis/disperse";

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
  totalValue,
}: {
  tokenAddress: `0x${string}`;
  transferDetails: {
    recipients: Address[];
    values: string[];
  };
  totalValue: number;
}) => {
  const walletClient = useWalletClient();
  const publicClient = usePublicClient();

  const result = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "decimals",
  });

  const account = useAccount();

  const [allowanceData, setAllowanceData] = useState<AllowanceData | null>(
    null
  );

  const handleClick = useCallback(async () => {
    if (
      !allowanceData ||
      !walletClient.data ||
      !result.data ||
      !account.address ||
      !publicClient
    )
      return;

    const disperse = getContract({
      abi: disperseAbi,
      address: DISPERSE_ADDRESS,
      client: { wallet: walletClient.data },
    });

    const token = getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client: { wallet: walletClient.data },
    });

    const data = await publicClient?.readContract({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "allowance",
      args: [account.address, PERMIT2_ADDRESS],
    });

    if (data <= parseUnits(String(totalValue), result.data)) {
      try {
        await token.write.approve([PERMIT2_ADDRESS as Address, MaxUint256]);
      } catch {
        return;
      }
    }

    const permit: PermitSingle = {
      details: {
        token: tokenAddress,
        amount: parseUnits(String(totalValue), result.data),
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
      primaryType: "PermitSingle",
      message: { ...values },
    });

    await disperse.write.disperseSingleWithPermit2([
      tokenAddress,
      transferDetails.recipients,
      transferDetails.values.map((v) => parseUnits(v, result.data)),
      permit,
      signature,
    ]);
  }, [
    account.address,
    allowanceData,
    publicClient,
    result.data,
    tokenAddress,
    totalValue,
    transferDetails.recipients,
    transferDetails.values,
    walletClient.data,
  ]);

  useEffect(() => {
    async function update() {
      if (publicClient && account.address) {
        const allowanceProvider = new AllowanceProvider(
          publicClient,
          PERMIT2_ADDRESS
        );

        const allowanceData = await allowanceProvider.getAllowanceData(
          tokenAddress,
          account.address,
          DISPERSE_ADDRESS
        );

        setAllowanceData(allowanceData);
      }
    }

    update();
  }, [publicClient, account.address, tokenAddress]);

  return (
    <Button color="default" onClick={handleClick}>
      Send
    </Button>
  );
};

export default Send;
