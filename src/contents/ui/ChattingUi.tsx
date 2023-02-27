import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { GameMode } from "../../core/engine/GameMain";
import { Managers } from "../../core/managers/Managers";
import { CHATTING_RECEIVE, GAMEMODE_CHANGE } from "../SignalType";
import { ChattingItem, ChattingItemType } from "./components/ChattingItem";
import PubSub from "pubsub-js";

export interface IMessageInfo {
  type: ChattingItemType;
  message: string;
  time: number;
}

export const ChattingUi = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const [messageList, setMessageList] = useState<IMessageInfo[]>([]);

  const onFocus = () => {
    setFocused(true);
    PubSub.publish(GAMEMODE_CHANGE, GameMode.CHATTING);
  };
  const onBlur = () => {
    setFocused(false);
    PubSub.publish(GAMEMODE_CHANGE, GameMode.GAME);
  };

  const handleKeyup = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitSendChat();
    }
  };

  const submitSendChat = () => {
    if (!inputRef.current) return;
    if (inputRef.current.value === "") return;

    Managers.Network.SendChatting(inputRef.current.value);

    inputRef.current.value = "";
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const receiveToken = PubSub.subscribe(
      CHATTING_RECEIVE,
      (message, data: IMessageInfo) => {
        setMessageList([...messageList, data]);
      }
    );
    scrollToBottom();

    return () => {
      PubSub.unsubscribe(receiveToken);
    };
  }, [messageList]);

  return (
    <div className="absolute bottom-4 right-4">
      <div className="w-96 h-96">
        <div className="flex flex-col flex-grow w-full h-full max-w-xl bg-white bg-opacity-10 shadow-xl rounded-lg overflow-hidden">
          <div
            ref={messageBoxRef}
            className="flex flex-col flex-grow h-0 p-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-600"
          >
            {messageList.map((messageInfo, index) => {
              return (
                <ChattingItem
                  key={index}
                  type={messageInfo.type}
                  message={messageInfo.message}
                  time={messageInfo.time}
                ></ChattingItem>
              );
            })}
          </div>

          <div className="bg-gray-300 bg-opacity-10 p-4">
            <input
              ref={inputRef}
              onFocus={onFocus}
              onBlur={onBlur}
              className="flex items-center h-10 w-full rounded px-3 text-sm"
              type="text"
              placeholder="메세지를 입력하세요."
              onKeyUp={handleKeyup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
