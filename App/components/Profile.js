import React, { useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import ProfileTabs from "./ProfileTabs";
import { useImmer } from "use-immer";
import NotFound from "./NotFound";

function Profile() {
  const appState = useContext(StateContext);

  const [state, setState] = useImmer({
    followRequestCount: 0,
    unfollowRequestCount: 0,
    followButtonPressed: false,
    profileData: {
      isFollowing: false,
      profileAvatar: "https://gravatar.com/avatar/?s=128",
      profileUsername: "...",
      counts: { followerCount: "", followingCount: "", postCount: "" },
    },
  });

  let { username } = useParams();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          {
            CancelToken: ourRequest.token,
          }
        );
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (e) {
        console.log("There was some error", e);
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.followRequestCount) {
      const ourRequest = Axios.CancelToken.source();
      setState((draft) => {
        draft.followButtonPressed = true;
      });

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            {
              CancelToken: ourRequest.token,
            }
          );

          setState((draft) => {
            draft.profileData.counts.followerCount++;
            draft.profileData.isFollowing = true;
            draft.followButtonPressed = false;
          });
        } catch (e) {
          console.log("There was some error", e);
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.followRequestCount]);

  useEffect(() => {
    if (state.unfollowRequestCount) {
      const ourRequest = Axios.CancelToken.source();
      setState((draft) => {
        draft.followButtonPressed = true;
      });

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            {
              CancelToken: ourRequest.token,
            }
          );

          setState((draft) => {
            draft.profileData.counts.followerCount--;
            draft.profileData.isFollowing = false;
            draft.followButtonPressed = false;
          });
        } catch (e) {
          console.log("There was some error", e);
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.unfollowRequestCount]);

  function handleFollow() {
    setState((draft) => {
      draft.followRequestCount++;
    });
  }

  function handleunFollow() {
    setState((draft) => {
      draft.unfollowRequestCount++;
    });
  }

  if (!state.profileData) {
    return <NotFound />;
  }

  return (
    <Page title="Profile Page">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {state.profileData.profileUsername}
        {appState.isLoggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={handleFollow}
              disabled={state.followButtonPressed}
              className="btn btn-primary btn-sm ml-2"
            >
              follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.isLoggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={handleunFollow}
              disabled={state.followButtonPressed}
              className="btn btn-danger btn-sm ml-2"
            >
              unfollow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileTabs
            count={state.profileData.counts.followerCount}
            action="followers"
          />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileTabs
            count={state.profileData.counts.followingCount}
            action="following"
          />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
