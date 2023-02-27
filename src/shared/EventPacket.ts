export enum EventPacket {
  // Game
  UpdatePlayerPosition = "update.player.position",
  UpdatePlayerQuaternion = "update.player.quaternion",
  UpdatePlayerScale = "update.player.scale",
  UpdatePlayerState = "update.player.state",

  // Chatting
  ChattingSend = "chatting.send",
  ChattingReceive = "chatting.receive",
}
