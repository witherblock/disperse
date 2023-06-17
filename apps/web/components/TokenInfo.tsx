import { useToken, useAccount } from "wagmi";
import TokenBalance from "./TokenBalance";

export default function TokenInfo({ address }: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useToken({
    address,
  });

  const account = useAccount();

  if (isLoading) return <div>Fetching token…</div>;
  if (isError) return <div>Error fetching token</div>;

  return (
    <div>
      <p>Symbol: {data?.symbol}</p>
      <p>Name: {data?.name}</p>
      {account.address ? (
        <TokenBalance
          userAddress={account.address}
          contractAddress={address}
          decimals={data?.decimals || 18}
        />
      ) : null}
    </div>
  );
}
