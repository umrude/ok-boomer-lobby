/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Button from "./Button";
import Result from "./Result";
import "./App.css";
import "./Dpad.css";
import io from "socket.io-client";
import ReactNipple from "react-nipple";

let socketClient = io("http://10.0.1.5:3001/players");

export default function Default() {
  const [colorId, setColorId] = useState("");
  const [data, setData] = useState(undefined);
  const [lose, setLose] = useState(false);
  const [winner, setWin] = useState(false);
  socketClient.on("changeColor", data => {
    setColorId(data);
  });
  socketClient.on("playerDied", data => {
    setLose(data);
  });

  socketClient.on("playerWin", data => {
    setWin(data);
  });

  const playerMoving = angle => {
    socketClient.emit("playerMovement", {
      playerId: socketClient.id,
      angle: angle
    });
  };

  return winner ? (
    <Result id={"died"} name={"You Win!"}></Result>
  ) : lose ? (
    <Result id={"died"} name={"Not Even Close"}></Result>
  ) : (
    <div id={colorId}>
      <div class="bombDiv">
        <Button
          bomb
          onTouchStart={() => {
            socketClient.emit("dropBomb", {
              playerId: socketClient.id,
              move: "Drop Bomb"
            });
          }}
        ></Button>
      </div>
      <div id={colorId}>
        <ReactNipple
          id={colorId}
          className="dpad"
          options={{
            mode: "dynamic",
            color: "#03ecfc",
            position: { top: "60%", left: "50%", height: "100%", width: "100%" }
          }}
          style={{
            outline: `1px dashed grey`,
            color: "black"
          }}
          onMove={(evt, data) => {
            const handleJoystickMove = (evt, data) => {
              let angle = data.angle.degree;
              playerMoving(angle);
              setData({ data });
            };
            handleJoystickMove(evt, data);
          }}
          onEnd={() => {
            socketClient.emit("playerMovementEnd", {
              playerId: socketClient.id
            });
          }}
        />
      </div>
    </div>
  );
}
