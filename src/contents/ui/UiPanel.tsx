import { useState, useEffect } from "react";
import { DefaultUi } from "./DefaultUi";
import { ChattingUi } from "./ChattingUi";
import PubSub from "pubsub-js";

export const UiPanel = () => {
  return (
    <>
      <ChattingUi />
      <DefaultUi />
    </>
  );
};
