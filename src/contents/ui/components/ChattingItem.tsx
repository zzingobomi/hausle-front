import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IMessageInfo } from "../ChattingUi";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import * as dayjs from "dayjs";

export enum ChattingItemType {
  SERVER = "Server",
  REMOTE = "Remote",
  MINE = "Mine",
}

export const ChattingItem = ({
  type,
  message,
  time,
  photoUrl,
}: IMessageInfo) => {
  return (
    <>
      {type === ChattingItemType.SERVER ? (
        <div className="flex w-full mt-2 mb-2 p-2 bg-gray-600 text-white justify-center rounded-md bg-opacity-50">
          <p className="text-sm">{message}</p>
        </div>
      ) : (
        <div
          className={`flex w-full mt-2 space-x-3 max-w-xs ${
            type === ChattingItemType.MINE ? "ml-auto justify-end" : ""
          }`}
        >
          {type === ChattingItemType.REMOTE ? (
            <div className="flex justify-center items-center flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
              {photoUrl ? (
                <img alt="user" src={photoUrl} className="rounded-full" />
              ) : (
                <FontAwesomeIcon icon={faUser} size="lg" />
              )}
            </div>
          ) : null}
          <div>
            <div
              className={`${
                type === ChattingItemType.MINE
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300"
              } p-3 rounded-l-lg rounded-br-lg`}
            >
              <p className="text-sm">{message}</p>
            </div>
            <span className="text-xs text-gray-400 leading-none">
              {dayjs.unix(time / 1000).format("MM/DD HH:mm")}
            </span>
          </div>
          {type === ChattingItemType.MINE ? (
            <div className="flex justify-center items-center flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
              {photoUrl ? (
                <img alt="user" src={photoUrl} className="rounded-full" />
              ) : (
                <FontAwesomeIcon icon={faUser} size="lg" />
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};
