import { Address, formatUnits } from "viem";
import { erc20ABI, useContractRead } from "wagmi";

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
  const balance = useContractRead({
    abi: erc20ABI,
    address: contractAddress,
    functionName: "balanceOf",
    args: [userAddress],
  });

  if (balance.isLoading) return <p>Fetching token…</p>;

  return <p>Balance: {formatUnits(balance.data || 0n, decimals)}</p>;
};

export default TokenBalance;
