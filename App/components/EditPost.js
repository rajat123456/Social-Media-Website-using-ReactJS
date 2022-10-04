import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, Link, withRouter } from "react-router-dom";
import Axios from "axios";
import LoadingIcon from "./LoadingIcon";
import ReactMarkdown from "react-markdown";
import ReactToolTip from "react-tooltip";
import { useImmerReducer } from "use-immer";

import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import { stateToHTML } from "draft-js-export-html";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import NotFound from "./NotFound";

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(EditorState.createEmpty());
  const [notFound, setNotFound] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const id = useParams().id;

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    try {
      async function fetchData() {
        const response = await Axios.get(`/post/${id}`, {
          CancelToken: ourRequest.token,
        });
        if (response.data) {
          const blocksFromHtml = htmlToDraft(response.data.body);
          const { contentBlocks, entityMap } = blocksFromHtml;
          const contentState = ContentState.createFromBlockArray(
            contentBlocks,
            entityMap
          );
          const myeditorState = EditorState.createWithContent(contentState);
          setBody(myeditorState);
          setTitle(response.data.title);
          setIsFetching(false);
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: "flashMessages",
              value: "You do not have permission to edit this post!",
            });
            props.history.push(`/post/${id}`);
          }
        } else {
          setNotFound(true);
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    } catch (e) {
      console.log("There was some error.", e);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        setIsSaving(true);
        const response = await Axios.post(
          `/post/${id}/edit`,
          {
            title,
            body: stateToHTML(body.getCurrentContent()),
            token: appState.user.token,
          },
          {
            CancelToken: ourRequest.token,
          }
        );
        setIsSaving(false);
        appDispatch({ type: "flashMessages", value: "Post is updated!" });
      } catch (e) {
        console.log("There was some error.", e);
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }

  if (notFound) {
    return <NotFound />;
  }

  if (isFetching) {
    return (
      <Page title="Loading">
        <LoadingIcon />
      </Page>
    );
  }

  return (
    <Page title="Edit Post">
      <Link to={`/post/${id}`}>
        <div className="small font-wight-bold">&laquo; Back to Post</div>
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <Editor
            toolbar={{
              inline: { inDropdown: true },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: true },
            }}
            editorState={body}
            wrapperClassName="border"
            editorClassName=""
            onEditorStateChange={(body) => setBody(body)}
          />
        </div>
        {isSaving ? (
          <div className="spinner-border" role="status">
            <span className="sr-only">Saving...</span>
          </div>
        ) : (
          <button className="btn btn-primary">Save Updates</button>
        )}
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
