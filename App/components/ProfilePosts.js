import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingIcon from "./LoadingIcon";
import Post from "./Post";

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const { username } = useParams();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    try {
      async function fetchData() {
        const response = await Axios.get(`/profile/${username}/posts`, {
          CancelToken: ourRequest.token,
        });
        setPosts(response.data);
        setIsLoading(false);
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    } catch (e) {
      console.log("There was some error", e);
    }
  }, [username]);

  if (isLoading) {
    return <LoadingIcon />;
  } else {
    return (
      <div className="list-group">
        {posts.map((post) => {
          return <Post key={post._id} post={post} noAuthor={true} />;
        })}
      </div>
    );
  }
}

export default ProfilePosts;
