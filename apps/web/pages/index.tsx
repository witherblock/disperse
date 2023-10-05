import { useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Textarea,
  Button,
} from "@nextui-org/react";
import { Address } from "wagmi";

import AppBar from "../components/AppBar";
import TokenInfo from "../components/TokenInfo";
import Send from "../components/Send";
import TransferInfo from "../components/TransferInfo";
import ClientComponent from "../components/ClientComponent";
import { isAddress } from "viem";

const tokens = [
  { key: "ETH", name: "ETH (Native)" },
  { key: "ERC20", name: "ERC20" },
];

const Web = () => {
  const [selected, setSelected] = useState(new Set(["ETH"]));
  const [address, setAddress] = useState<Address>(
    "0xda5bb55c0eA3f77321A888CA202cb84aE30C6AF5"
  );
  const [transferDetails, setTransferDetails] = useState<{
    recipients: Address[];
    values: string[];
  }>({
    recipients: [],
    values: [],
  });
  const [totalValue, setTotalValue] = useState(0n);
  const [error, setError] = useState("");

  const selectedValue = useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );

  const handleChange = (e: { target: { value: any } }) => {
    const value = e.target.value;

    if (isAddress(value)) {
      setAddress(value);
      setError("");
    } else setError("Invalid Address");
  };

  const handleTextareaChange = (e: { target: { value: string } }) => {
    const text: string = e.target.value;

    // Split each line
    const lines = text.split(/\r?\n/);

    const splitLines = lines.map((t) => {
      let r = t.split("=");
      if (r.length !== 2) {
        r = t.split(",");
        if (r.length !== 2) {
          r = t.split(" ");
        }
      }

      return r;
    });

    const recipients = splitLines.map((a) => a[0]);
    const values = splitLines.map((a) => a[1]);

    const _totalValue = values.reduce((acc, v) => acc + BigInt(v), 0n);

    setTotalValue(_totalValue);

    setTransferDetails({ recipients: recipients as Address[], values });
  };

  console.log(selectedValue);
  return (
    <div className="bg-black h-screen w-full">
      <AppBar />
      <div className="w-100 justify-items-center flex">
        <div className="mx-auto my-8 w-1/3">
          <h1 className="text-white text-2 text-5xl text-left font-bold w-full mb-8">
            Disperse
          </h1>
          <div className="flex mb-6">
            <Dropdown>
              <DropdownTrigger className="mr-4">
                <Button
                  color={selectedValue == "ERC2O" ? "secondary" : "secondary"}
                  size="lg"
                  variant="flat"
                >
                  {selectedValue}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Token Selector"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selected}
                //@ts-ignore
                onSelectionChange={setSelected}
                items={tokens}
              >
                {(item) => (
                  <DropdownItem key={(item as any).key}>
                    {(item as any).name}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
            {selectedValue === "ERC20" ? (
              <div className="w-full">
                <Input
                  onChange={handleChange}
                  placeholder="Enter token address here"
                  size="lg"
                  color={error ? "danger" : "default"}
                />
              </div>
            ) : null}
          </div>
          <TokenInfo address={address} />
          <Textarea
            width="520px"
            placeholder="0x314ab97b76e39d63c78d5c86c2daf8eaa306b182 3.141592
            0x271bffabd0f79b8bd4d7a1c245b7ec5b576ea98a,2.7182
            0x141ca95b6177615fb1417cf70e930e102bf8f584=1.41421"
            rows={6}
            onChange={handleTextareaChange}
          />
          {address !== "0x" ? (
            <TransferInfo address={address} totalValue={totalValue} />
          ) : null}
          <Send
            totalValue={totalValue}
            isNative={selectedValue === "ETH"}
            tokenAddress={address}
            transferDetails={transferDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default function WebPage() {
  return (
    <ClientComponent>
      <Web />
    </ClientComponent>
  );
}
