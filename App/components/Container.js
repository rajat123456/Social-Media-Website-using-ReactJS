import React from "react";

function Container(props) {
  if (props.wide) {
    return <div className="container py-md-5">{props.children}</div>;
  } else {
    return (
      <div className="container container--narrow py-md-5">
        {props.children}
      </div>
    );
  }
}

export default Container;
