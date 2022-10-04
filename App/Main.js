import React, { useState, useEffect, useReducer, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
import { CSSTransition } from "react-transition-group";
Axios.defaults.baseURL =
  process.env.BACKENDURL || "https://backendapireactsocialmedia.herokuapp.com";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

import LoadingIcon from "./components/LoadingIcon";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
const Chat = React.lazy(() => import("./components/Chat"));
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";

function Main() {
  const initialState = {
    isLoggedIn: Boolean(localStorage.getItem("rsmToken")),
    flashMessages: [],
    user: {
      username: localStorage.getItem("rsmUsername"),
      token: localStorage.getItem("rsmToken"),
      avatar: localStorage.getItem("rsmAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.isLoggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        draft.isLoggedIn = false;
        draft.user = {
          username: "",
          token: "",
          avatar: "",
        };
        return;
      case "flashMessages":
        draft.flashMessages.push(action.value);
        return;
      case "searchOpen":
        draft.isSearchOpen = true;
        return;
      case "searchClose":
        draft.isSearchOpen = false;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "chatClose":
        draft.isChatOpen = false;
        return;
      case "incrementChatCount":
        draft.unreadChatCount++;
        return;
      case "clearChatCount":
        draft.unreadChatCount = 0;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.isLoggedIn) {
      localStorage.setItem("rsmUsername", state.user.username);
      localStorage.setItem("rsmToken", state.user.token);
      localStorage.setItem("rsmAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("rsmToken");
      localStorage.removeItem("rsmUsername");
      localStorage.removeItem("rsmAvatar");
    }
  }, [state.isLoggedIn]);

  //check if token is expired
  useEffect(() => {
    if (state.isLoggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            "/checkToken",
            { token: state.user.rsmToken },
            { CancelToken: ourRequest.token }
          );
          if (response.data) {
            appDispatch({ type: "logout" });
            appDispatch({
              type: "flashMessages",
              value: "Token expired. Please log in again",
            });
          }
        } catch (e) {
          console.log("There was some error.", e);
        }
      }
      fetchData();
      return () => ourRequest.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.isLoggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Suspense fallback="">{state.isLoggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#root"));

//now if we save new changes
//it'll just load new component asynchronously
if (module.hot) {
  module.hot.accept();
}
