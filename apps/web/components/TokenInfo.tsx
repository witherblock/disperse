import { useAccount, useReadContracts } from "wagmi";
import TokenBalance from "./TokenBalance";
import { erc20Abi, zeroAddress } from "viem";

export default function TokenInfo({ address }: { address: `0x${string}` }) {
  const token = {
    address,
    abi: erc20Abi,
  };

  const { data, isError, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        ...token,
        functionName: "symbol",
      },
      {
        ...token,
        functionName: "name",
      },
      {
        ...token,
        functionName: "decimals",
      },
    ],
  });

  const account = useAccount();

  if (address === zeroAddress) return <></>;

  if (isLoading) return <div className="mb-4">Fetching token…</div>;
  if (isError || !data) return <div className="mb-4">Error fetching token</div>;

  return (
    <div className="mb-4">
      <p>Symbol: {data[0]}</p>
      <p>Name: {data[1]}</p>
      {account.address ? (
        <TokenBalance
          userAddress={account.address}
          contractAddress={address}
          decimals={data[2] || 18}
        />
      ) : null}
    </div>
  );
}
