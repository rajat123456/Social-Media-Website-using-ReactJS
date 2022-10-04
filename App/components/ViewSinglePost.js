import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, Link, withRouter } from "react-router-dom";
import Axios from "axios";
import LoadingIcon from "./LoadingIcon";
import ReactMarkdown from "react-markdown";
import ReactToolTip from "react-tooltip";

import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState([]);
  const [user, setUser] = useState();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const { id } = useParams();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    try {
      async function fetchData() {
        const response = await Axios.get(`/post/${id}`, {
          CancelToken: ourRequest.token,
        });
        setPost(response.data);
        setUser(response.data.author.username);
        setIsLoading(false);
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    } catch (e) {
      console.log("There was some error.", e);
    }
  }, [id]);

  async function deleteHandler() {
    const confirm = window.confirm(
      "Are you sure you want to delete this post ?"
    );
    if (confirm) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        });
        if (response.data == "Success") {
          appDispatch({
            type: "flashMessages",
            value: "Post was successfully deleted!",
          });
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("There was some error.", e);
      }
    }
  }

  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading) {
    return (
      <Page title="Loading">
        <LoadingIcon />
      </Page>
    );
  } else {
    const date = new Date(post.createdDate);
    const formattedDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;

    return (
      <Page title={post.title}>
        <div className="d-flex justify-content-between">
          <h2>{post.title}</h2>
          {user == appState.user.username && (
            <span className="pt-2">
              <Link
                to={`/post/${id}/edit`}
                data-tip="Edit"
                data-for="edit"
                className="text-primary mr-2"
              >
                <i className="fas fa-edit"></i>
              </Link>
              <ReactToolTip id="edit" className="custom-tooltip" />{" "}
              <a
                onClick={deleteHandler}
                data-tip="Delete"
                data-for="delete"
                className="delete-post-button text-danger"
              >
                <i className="fas fa-trash"></i>
              </a>
              <ReactToolTip id="delete" className="custom-tooltip" />
            </span>
          )}
        </div>

        <p className="text-muted small mb-4">
          <Link to={`/profile/${post.author.username}`}>
            <img className="avatar-tiny" src={post.author.avatar} />
          </Link>
          Posted by{" "}
          <Link to={`/profile/${post.author.username}`}>
            {post.author.username}
          </Link>{" "}
          on {formattedDate}
        </p>
        <div className="body-content">
          <div dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      </Page>
    );
  }
}

export default withRouter(ViewSinglePost);
