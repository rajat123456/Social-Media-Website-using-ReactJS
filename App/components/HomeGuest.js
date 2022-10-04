import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function HomeGuest() {
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      hasError: false,
      errorMessage: "",
      count: 0,
      isUnique: false,
    },
    email: {
      value: "",
      hasError: false,
      errorMessage: "",
      count: 0,
      isUnique: false,
    },
    password: {
      value: "",
      hasError: false,
      errorMessage: "",
    },
    requestCount: 0,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasError = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasError = true;
          draft.username.errorMessage =
            "Username must be less than 30 chars long.";
        }
        if (
          draft.username.value &&
          !/^([a-zA-Z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasError = true;
          draft.username.errorMessage =
            "Username can only contain letters and numbers.";
        }
        return;
      case "usernameAfterDelay":
        if (draft.username.value.length <= 3) {
          draft.username.hasError = true;
          draft.username.errorMessage =
            "Username must be more than 3 chars long.";
        }
        if (!draft.username.hasError && !action.noRequest) {
          draft.username.count++;
        }
        return;
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasError = true;
          draft.username.errorMessage = "Username is already taken";
          draft.username.isUnique = false;
        } else {
          draft.username.isUnique = true;
        }
        return;
      case "emailImmediately":
        draft.email.hasError = false;
        draft.email.value = action.value;
        return;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasError = true;
          draft.email.errorMessage = "You must provide a valid email address.";
        }
        if (!draft.email.hasError && !action.noRequest) {
          draft.email.count++;
        }

        return;
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasError = true;
          draft.email.errorMessage = "Email is already taken";
          draft.email.isUnique = false;
        } else {
          draft.email.isUnique = true;
        }
        return;
      case "passwordImmediately":
        draft.password.hasError = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasError = true;
          draft.password.errorMessage = "Password must be less than 50 chars.";
        }
        return;
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasError = true;
          draft.password.errorMessage =
            "Password must be more than 12 chars long.";
        }
        return;
      case "submitForm":
        if (
          !draft.username.hasError &&
          draft.username.isUnique &&
          !draft.email.hasError &&
          draft.email.isUnique &&
          !draft.password.hasError
        ) {
          draft.requestCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(function () {
        dispatch({ type: "usernameAfterDelay" });
      }, 700);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(function () {
        dispatch({ type: "emailAfterDelay" });
      }, 700);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(function () {
        dispatch({ type: "passwordAfterDelay" });
      }, 700);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.username.count) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { CancelToken: ourRequest.token }
          );
          dispatch({ type: "usernameUniqueResults", value: response.data });
        } catch (e) {
          console.log("There was some error.", e);
        }
      }
      fetchData();
      return () => ourRequest.cancel();
    }
  }, [state.username.count]);

  useEffect(() => {
    if (state.email.count) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            "/doesEmailExist",
            { email: state.email.value },
            { CancelToken: ourRequest.token }
          );
          dispatch({ type: "emailUniqueResults", value: response.data });
        } catch (e) {
          console.log("There was some error.", e);
        }
      }
      fetchData();
      return () => ourRequest.cancel();
    }
  }, [state.email.count]);

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value,
            },
            { CancelToken: ourRequest.token }
          );
          appDispatch({ type: "login", data: response.data });
          appDispatch({
            type: "flashMessages",
            value: "Congrats! You are successfully signed in with new account",
          });
        } catch (e) {
          console.log("There was some error.", e);
        }
      }
      fetchData();
      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({
      type: "usernameAfterDelay",
      value: state.username.value,
      noRequest: true,
    });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({
      type: "emailAfterDelay",
      value: state.email.value,
      noRequest: true,
    });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
  }

  return (
    <Page title="Home" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
            posts that are reminiscent of the late 90&rsquo;s email forwards? We
            believe getting back to actually writing is the key to enjoying the
            internet again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "usernameImmediately",
                    value: e.target.value,
                  })
                }
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
              <CSSTransition
                in={state.username.hasError}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.username.errorMessage}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "emailImmediately",
                    value: e.target.value,
                  })
                }
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />
              <CSSTransition
                in={state.email.hasError}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.email.errorMessage}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "passwordImmediately",
                    value: e.target.value,
                  })
                }
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
              />
              <CSSTransition
                in={state.password.hasError}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.password.errorMessage}
                </div>
              </CSSTransition>
            </div>
            <button
              type="submit"
              className="py-3 mt-4 btn btn-lg btn-success btn-block"
            >
              Sign up for RSM
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
