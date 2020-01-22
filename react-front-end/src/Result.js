import React from "react";
import "./Result.css";
export default function Result(props) {
  return (
    <div class={"parent"}>
      <h1 id={props.id}>{props.name}</h1>
    </div>
  );
}
