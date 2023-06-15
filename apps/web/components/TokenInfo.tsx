import { useToken, erc20ABI, useContractRead, useAccount } from "wagmi";
import { utils as ethersUtils } from "ethers";

const Balance = ({ contractAddress, userAddress, decimals }) => {
  const balance = useContractRead({
    abi: erc20ABI,
    address: contractAddress,
    functionName: "balanceOf",
    args: [userAddress],
  });

  if (balance.isLoading) return <div>Fetching token…</div>;

  return <p>Balance: {ethersUtils.formatUnits(balance.data, decimals)}</p>;
};

export default function TokenInfo({ address }: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useToken({
    address,
  });

  const account = useAccount();

  console.log(data);

  if (isLoading) return <div>Fetching token…</div>;
  if (isError) return <div>Error fetching token</div>;

  return (
    <div>
      <p>Symbol: {data?.symbol}</p>
      <p>Name: {data?.name}</p>
      {account.address ? (
        <Balance
          userAddress={account.address}
          contractAddress={address}
          decimals={data.decimals}
        />
      ) : null}
    </div>
  );
}
