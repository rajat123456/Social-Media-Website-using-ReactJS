import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>Oops, we cannot find that page.</h2>
        <p>
          You can always visit <Link to={"/"}> Homepage</Link> to get a fresh
          start.
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
