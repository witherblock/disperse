import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function AppBar() {
  return (
    <nav className="w-full">
      <div className="flex w-9/12 py-6 mx-auto border-b-1 border-white border-opacity-20">
        <div className="font-bold text-white justify-start w-full items-center flex">
          <p>Disperse</p>
        </div>
        <div className="justify-end w-full flex">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
