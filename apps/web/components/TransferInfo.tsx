import {
  useContractReads,
  useAccount,
  erc20ABI,
  Address,
  useContractRead,
} from "wagmi";
import { BigNumber, utils as ethersUtils } from "ethers";

export default function TransferInfo({
  address,
  totalValue,
}: {
  address: Address;
  totalValue: BigNumber;
}) {
  const account = useAccount();

  const reads = useContractReads({
    contracts: [
      {
        abi: erc20ABI,
        address,
        functionName: "decimals",
      },
      {
        abi: erc20ABI,
        address,
        functionName: "balanceOf",
        args: [account?.address],
      },
    ],
  });

  if (reads.isLoading || !reads.data) return <div>Loading</div>;
  if (reads.isError) return <div>Error fetching</div>;

  console.log(reads.data[0]);

  return (
    <div>
      <p>Total Value: {ethersUtils.formatUnits(totalValue, reads.data[0])}</p>
      <p>
        Your Balance: {ethersUtils.formatUnits(reads.data[1], reads.data[0])}
      </p>
      <p>
        Remaining:{" "}
        {ethersUtils.formatUnits(
          reads.data[1].sub(totalValue.mul(reads.data[0])),
          reads.data[0]
        )}
      </p>
    </div>
  );
}
