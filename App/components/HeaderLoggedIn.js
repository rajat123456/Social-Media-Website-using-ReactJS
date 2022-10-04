import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ReactToolTip from "react-tooltip";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function HeaderLoggedIn(props) {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  function handleSignOut() {
    appDispatch({ type: "logout" });
    appDispatch({
      type: "flashMessages",
      value: "You have successfully logged out",
    });
  }
  return (
    <div className="flex-row my-3 my-md-0">
      <a
        data-tip="Search"
        data-for="search"
        onClick={() => appDispatch({ type: "searchOpen" })}
        href="#"
        className="text-white mr-2 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </a>
      <ReactToolTip place="bottom" id="search" className="custom-tooltip" />{" "}
      <span
        onClick={() => appDispatch({ type: "toggleChat" })}
        data-tip="Chat"
        data-for="chat"
        className="mr-2 header-chat-icon text-white"
      >
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount ? appState.unreadChatCount : ""}
      </span>
      <ReactToolTip place="bottom" id="chat" className="custom-tooltip" />{" "}
      <Link
        data-tip="My Profile"
        data-for="myProfile"
        to={`/profile/${appState.user.username}`}
        className="mr-2"
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactToolTip place="bottom" id="myProfile" className="custom-tooltip" />{" "}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>{" "}
      <button onClick={handleSignOut} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
