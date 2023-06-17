import React from "react";
import dynamic from "next/dynamic";

const ClientComponent = (props: { children: React.ReactNode }) => (
  <React.Fragment>{props.children}</React.Fragment>
);

export default dynamic(() => Promise.resolve(ClientComponent), {
  ssr: false,
});
