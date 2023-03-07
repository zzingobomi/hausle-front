import { DefaultUi } from "./DefaultUi";
import { ChattingUi } from "./ChattingUi";

export const UiPanel = () => {
  return (
    <>
      <ChattingUi />
      <DefaultUi />
    </>
  );
};
