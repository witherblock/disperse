import {
  useAccount,
  erc20ABI,
  Address,
  useContractRead,
  useToken,
} from "wagmi";
import { formatUnits } from "viem";
import TokenBalance from "./TokenBalance";

export default function TransferInfo({
  address,
  totalValue,
}: {
  address: Address;
  totalValue: bigint;
}) {
  const account = useAccount();

  const { data, isError, isLoading } = useToken({
    address,
  });

  const balance = useContractRead({
    abi: erc20ABI,
    address,
    functionName: "balanceOf",
    args: [account?.address || "0x"],
  });

  if (isLoading || !data) return <div>Loading</div>;
  if (isError) return <div>Error fetching</div>;

  return (
    <div>
      <div>Total Value: {formatUnits(totalValue, data?.decimals || 18)}</div>
      <div>
        Your Balance:{" "}
        {account.address ? (
          <TokenBalance
            userAddress={account.address}
            contractAddress={address}
            decimals={data?.decimals || 18}
          />
        ) : null}
      </div>
      <div>
        Remaining:{" "}
        {formatUnits(
          balance?.data || 0n - totalValue * BigInt(data?.decimals || 18),
          data?.decimals || 18
        )}
      </div>
    </div>
  );
}
