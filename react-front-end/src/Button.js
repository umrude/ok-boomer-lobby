import React from "react";
let classNames = require("classnames");

export default function Button(props) {
  const buttonClass = classNames("button", {
    "button--bomb": props.bomb,
    "button--Arrow": props.arrow
  });
  return (
    <button
      className={buttonClass}
      id={props.id}
      onTouchStart={props.onTouchStart}
      onTouchEnd={props.onTouchEnd}
    >
      {props.children}
    </button>
  );
}
