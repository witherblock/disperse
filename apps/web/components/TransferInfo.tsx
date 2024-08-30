import { useAccount, useReadContracts } from "wagmi";
import { Address, erc20Abi, formatUnits, parseUnits, zeroAddress } from "viem";
import TokenBalance from "./TokenBalance";

export default function TransferInfo({
  address,
  totalValue,
}: {
  address: Address;
  totalValue: number;
}) {
  const account = useAccount();

  const token = { address, abi: erc20Abi };

  const { data, isError, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        ...token,
        functionName: "decimals",
      },
      { ...token, functionName: "balanceOf", args: [account?.address || "0x"] },
    ],
  });

  if (address === zeroAddress) return <></>;
  if (isLoading || !data) return <div className="mb-4">Loading</div>;
  if (isError) return <div className="mb-4">Error fetching</div>;

  return (
    <div className="mb-4">
      <div>Total Value: {totalValue}</div>
      <div>
        {account.address ? (
          <TokenBalance
            userAddress={account.address}
            contractAddress={address}
            decimals={data[0] || 18}
          />
        ) : null}
      </div>
      <div>
        Remaining:{" "}
        {formatUnits(
          (data[1] || 0n) - parseUnits(String(totalValue), data[0] || 18),
          data[0] || 18
        )}
      </div>
    </div>
  );
}
