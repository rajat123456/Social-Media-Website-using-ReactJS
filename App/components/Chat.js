import React, { useContext, useEffect, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import io from "socket.io-client";
import { Link } from "react-router-dom";

function Chat() {
  const [state, setState] = useImmer({
    chatMessages: [],
    inputMessage: "",
  });
  const socket = useRef(null);
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "clearChatCount" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    socket.current = io(
      process.env.BACKENDURL ||
        "https://backendapireactsocialmedia.herokuapp.com"
    );

    socket.current.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });

    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementChatCount" });
    }
  }, [state.chatMessages]);

  function handleSubmit(e) {
    e.preventDefault();

    socket.current.emit("chatFromBrowser", {
      message: state.inputMessage,
      token: appState.user.token,
    });

    setState((draft) => {
      draft.chatMessages.push({
        inputMessage: draft.inputMessage,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.inputMessage = "";
    });
  }

  function handleChange(e) {
    const input = e.target.value;
    setState((draft) => {
      draft.inputMessage = input;
    });
  }

  return (
    <div
      id="chat-wrapper"
      className={
        "chat-wrapper shadow border-top border-left border-right " +
        (appState.isChatOpen ? "chat-wrapper--is-visible" : "")
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: "chatClose" })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">
                    {message.inputMessage}
                  </div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>
                      {message.username}
                      {": "}
                    </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          onChange={handleChange}
          value={state.inputMessage}
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  );
}

export default Chat;
