import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingIcon from "./LoadingIcon";

function ProfileTabs(props) {
  const { count } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const { username } = useParams();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    try {
      async function fetchData() {
        const response = await Axios.get(
          `/profile/${username}/${props.action}`,
          {
            CancelToken: ourRequest.token,
          }
        );
        setUsers(response.data);
        setIsLoading(false);
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    } catch (e) {
      console.log("There was some error", e);
    }
  }, [username, count]);

  if (isLoading) {
    return <LoadingIcon />;
  } else {
    return (
      <div className="list-group">
        {users.map((user) => {
          return (
            <Link
              key={user.username}
              to={`/profile/${user.username}`}
              className="list-group-item list-group-item-action"
            >
              <img className="avatar-tiny" src={user.avatar} /> {user.username}
            </Link>
          );
        })}
      </div>
    );
  }
}

export default ProfileTabs;
