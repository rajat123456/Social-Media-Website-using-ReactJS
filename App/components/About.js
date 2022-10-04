import React from "react";
import Page from "./Page";

function About() {
  return (
    <Page title="About Us">
      <h2>About Us</h2>
      <p className="lead text-muted">
        About Page of the React Social Media App.
      </p>
      <p>Here you can write posts, follow people and chat with others.</p>
    </Page>
  );
}

export default About;
