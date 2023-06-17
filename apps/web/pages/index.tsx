import { useMemo, useState } from "react";
import { Dropdown, Input, Spacer, Textarea, styled } from "@nextui-org/react";
import { Address } from "wagmi";

import AppBar from "../components/AppBar";
import TokenInfo from "../components/TokenInfo";
import Send from "../components/Send";
import TransferInfo from "../components/TransferInfo";
import ClientComponent from "../components/ClientComponent";
import { isAddress } from "viem";

const Box = styled(`div`);

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

  return (
    <>
      <AppBar />
      <Box css={{ width: "100%", justifyItems: "center", display: "flex" }}>
        <Box className="mx-auto my-5" css={{ mx: "auto", my: "20px" }}>
          <h1>Disperse</h1>
          <Box
            className="flex mb-6"
            css={{ display: "flex", marginBottom: "24px" }}
          >
            <Dropdown>
              <Dropdown.Button
                color={selectedValue === "ETH" ? "secondary" : "gradient"}
                css={{ mr: "8px" }}
                flat
              >
                {selectedValue}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Token Selector"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selected}
                //@ts-ignore
                onSelectionChange={setSelected}
                items={tokens}
              >
                {(item) => (
                  <Dropdown.Item key={(item as any).key}>
                    {(item as any).name}
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
            {selectedValue === "ERC20" ? (
              <Input
                onChange={handleChange}
                placeholder="Enter token address here"
                width="400px"
                status={error ? "error" : "default"}
                color={error ? "error" : "default"}
                helperColor={error ? "error" : "default"}
                helperText={error}
              />
            ) : null}
          </Box>
          <TokenInfo address={address} />
          <Spacer />
          <Textarea
            width="520px"
            placeholder="0x314ab97b76e39d63c78d5c86c2daf8eaa306b182 3.141592
            0x271bffabd0f79b8bd4d7a1c245b7ec5b576ea98a,2.7182
            0x141ca95b6177615fb1417cf70e930e102bf8f584=1.41421"
            rows={6}
            onChange={handleTextareaChange}
          />
          <Spacer />
          {address !== "0x" ? (
            <TransferInfo address={address} totalValue={totalValue} />
          ) : null}
          <Spacer />
          <Send
            totalValue={totalValue}
            isNative={selectedValue === "ETH"}
            tokenAddress={address}
            transferDetails={transferDetails}
          />
        </Box>
      </Box>
    </>
  );
};

export default function WebPage() {
  return (
    <ClientComponent>
      <Web />
    </ClientComponent>
  );
}
