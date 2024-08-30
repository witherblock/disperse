import { Address, erc20Abi, formatUnits } from "viem";
import { useReadContract } from "wagmi";

interface TokenBalanceProps {
  contractAddress: Address;
  userAddress: Address;
  decimals: number;
}

const TokenBalance = ({
  contractAddress,
  userAddress,
  decimals,
}: TokenBalanceProps) => {
  const balance = useReadContract({
    abi: erc20Abi,
    address: contractAddress,
    functionName: "balanceOf",
    args: [userAddress],
  });

  if (balance.isLoading) return <p>Fetching token…</p>;

  return <p>Balance: {formatUnits(balance.data || 0n, decimals)}</p>;
};

export default TokenBalance;
