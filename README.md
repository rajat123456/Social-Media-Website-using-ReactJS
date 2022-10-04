# react-social-media

## Social Media App using ReactJs

*Creating React app from scratch*

## Takeaways
```bash
mkdir my-react-app
cd my-react-app
npm init -y
npm install --save react react-dom
```

index.html Main.js  


//package are on our computer, so to bundle it to deliver to users  
//and to handle JSX  
```bash
npm install --save webpack webpack-cli webpack-dev-server

npm install --save @babel/core @babel/preset-env @babel/preset-react babel-loader
```

//webpack configuration file  
webpack.config.js  
```
const path = require("path");

module.exports = {
  entry: "./app/Main.js",
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "app"),
    filename: "bundled.js",
  },
  mode: "development",
  devtool: "source-map",
  devServer: {
    port: 3000,
    contentBase: path.join(__dirname, "app"),
    hot: true,
    historyApiFallback: { index: "index.html" },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-react",
              ["@babel/preset-env", { targets: { node: "12" } }],
            ],
          },
        },
      },
    ],
  },
};
```
//now include script tag to include bundled.js file  

index.html  
```
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title></title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/bundled.js"></script>
  </body>
</html>
```

created components  

//for routing  
```bash
npm install --save react-router-dom
```

```
import {BrowserRouter, Switch, Route, Link } from 'react-route-dom';

function Main() {
  return (
<>
    <BrowserRouter>
      <Header />
      <Switch>
        <Route path="/" exact>
          <HomeGuest />
        </Route>
        <Route path="/about-us">
          <About />
        </Route>
        <Route path="/terms">
          <Terms />
        </Route>
      </Switch>
      <Footer />
    </BrowserRouter>

	<footer>
      <p>
        <Link to="/" className="mx-1">
          Home
        </Link>{" "}
        |
        <Link className="mx-1" to="/about-us">
          About Us
        </Link>{" "}
        |
        <Link className="mx-1" to="/terms">
          Terms
        </Link>
      </p>
</footer>
</>
  );
}
```
//using mongodb for database  
//sign up at mondodb.com and click on Connections  
//Type database name and collection name  
//now click on connect>add different IP address  
//0.0.0.0/0 for all users IP  
//set admin username and password  
//Choose a connection method>connect you app  
//Driver=Node and copy string  
//register using axios request to mongodb  

```
async function handleSubmit(e) {
    e.preventDefault();
    try {
      await Axios.post("http://localhost:8080/register", {
        username,
        email,
        password,
      });
      console.log("Successfully registered!");
    } catch (e) {
      console.log(e);
    }
  }
```

//sign in
```
async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post("http://localhost:8080/login", {
        username,
        password,
      });
      if (response.data) {
        localStorage.setItem("rsmToken", response.data.token);
        localStorage.setItem("rsmUsername", response.data.username);
        localStorage.setItem("rsmAvatar", response.data.avatar);
        props.setIsLoggedIn(true);
      } else {
        console.log("Incorrect username/password");
      }
    } catch (e) {
      console.log("Error occured", e);
    }
  }
```

//set up routing, to redirect to new post address  
```
	<Route path="/post/:id">
          <ViewSinglePost />
        </Route>
```
//then in createPost function  
```
import {withRouter} from 'react-router-dom'

props.history.push(`/post/${response.data}`)
``` 
//using react context API  
//for making state globally available  
```
create ExampleContext.js
import {createContext} from 'react';
const ExampleContext = createContext();
export default ExampleContext;
``` 
//import this context in main file  
//wrap everything inside it  
//pass the states in value  
```
<ExampleContext.Provider value={{setIsLoggedIn, addFlashMessage}} >
...
</ExampleContext.Provider>
```
//using Context in component, CreatePost  
```
import {useContext} from 'react';
import ExampleContext from '../ExampleContext';

function CreatePost() {
const {addFlashMessage} = useContext(ExampleContext);
```
//now call it directly as {addFlashMessage} to use  

---------------------------------------------------  
//now to make it further more easier and cleaner  
//for state to be used in different components  
//we will levarage useReducer from react  
// it's mixture(or duo) useContext+useReducer  
```
import {useReducer} from react;

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
//we have made two context files to avoid
//unnecessary reloading of components where 
//state change isn't happening

function main(){
const initialState = {
isLoggedIn: Boolean(localStorage.getItem('key'))
flashMessages: []
}

function ourReducer(state, action){
    switch (action.type) {
      case "login":
        return {
          isLoggedIn: true,
          flashMessages: state.flashMessages,
        };
      case "logout":
        return {
          isLoggedIn: false,
          flashMessages: state.flashMessages,
        };
      case "flashMessages":
        return {
          isLoggedIn: state.isLoggedIn,
          flashMessages: state.flashMessages.concat(action.value),
        };
    }
}
const [state, dispatch] = useReducer(ourReducer, initialState);
```
//wrap whole return in  
```
<StateContext.Provider value={state}>
<DispatchContext.Provider value={dispatch}>
...
</StateContext.Provider>
</DispatchContext.Provider>
```
//in Header we only need state change  
//so we'll import StateContext and use state  

//in HeaderLoggedIn and HeaderLoggedOut and CreatePost  
//we need to dispatch actions like login, logout and  
//flashmessage so we'll use DispatchContext there like  
```
import {useContext} from 'react';

import DispatchContext from '../DispatchContext';

function HeaderLoggedIn() {
const appDispatch = useContext(DispatchContext);
function handleSignOut() {
    appDispatch({ type: "logout" });
    localStorage.removeItem("rsmToken");
    localStorage.removeItem("rsmUsername");
    localStorage.removeItem("rsmAvatar");
  }
```

//because we cannot mutate state in react  
//we will use immer to levarage immutability  
```bash
npm install immer use-immer
```
```
import {useImmerReducer} from 'use-immer';
```
//just rename useReducer to useImmerReducer  
//and in ourReducer function  
```
function ourReducer(draft, action){
    switch (action.type) {
      case "login":
	draft.isLoggedIn = true
        return;
      case "logout":
	draft.isLoggedIn = false
        return;
      case "flashMessages":
	draft.flashMessages.push(action.value)
        return;
    }
}
```
//to use some dynamic value from URL  
//we levarage useParams from react-router-dom  
```
import {useParams} from 'react-router-dom';

const {username} = useParams();
```
//we sent this dynnamic var in Route  
```
<Route path='/profile/:username'>
	<Profile />
</Route>
```

//when we interact with a component that makes  
//some async request and the user goes away  
//from that component then memoey leak warning  
//will be issue and to fix this  
//we will cancel await request in the useEffect  
```
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
  }, []);
```
//react lazy loading is used to exempt some components  
//which're either large in size or take take more time  
//to save up resources  
```
import { Suspense } from React;

const Chat = React.lazy(() => import('./components/Chat'));

<Suspense fallback="">
	<Chat />
</Suspense>
```

//for production purposes  
//building dist copy of our project  

webpack.config.js  
```
const currentTask = process.env.npm_lifecycle_event;
const path = require("path");
const Dotenv = require("dotenv-webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fse = require("fs-extra");

/*
  Because I didn't bother making CSS part of our
  webpack workflow for this project I'm just
  manually copying our CSS file to the DIST folder.
*/

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy files", function () {
      fse.copySync("./app/main.css", "./dist/main.css");

      /*
        If you needed to copy another file or folder
        such as your "images" folder, you could just
        call fse.copySync() as many times as you need
        to here to cover all of your files/folders.
      */
    });
  }
}

config = {
  entry: "./app/Main.js",
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "app"),
    filename: "bundled.js",
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "app/index-template.html",
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
  ],
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-react",
              ["@babel/preset-env", { targets: { node: "12" } }],
            ],
          },
        },
      },
    ],
  },
};

if (currentTask == "webpackDev" || currentTask == "dev") {
  config.devtool = "source-map";
  config.devServer = {
    port: 3000,
    contentBase: path.join(__dirname, "app"),
    hot: true,
    historyApiFallback: { index: "index.html" },
  };
}

if (currentTask == "webpackBuild") {
  config.plugins.push(new CleanWebpackPlugin(), new RunAfterCompile());
  config.mode = "production";
  config.output = {
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
  };
}

module.exports = config;
```

//npm install above required packages  

.env  
BACKENDURL = http://localhost:8080  

change index to index-template  

previewDist.js  
```
const express = require("express");
const path = require("path");
const app = new express();
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => res.sendFile(__dirname + "/dist/index.html"));
app.listen("4000");
```

package.json  
```
"scripts": {
    "dev": "webpack-dev-server",
    "webpackBuild": "webpack",
    "previewDist": "node previewDist"
}
```
//for slow connection, we are building static html  
//to show up as skeleton till bundle.js loads  

generateHtml.js  
```
import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import Footer from "./app/components/Footer";
import Header from "./app/components/Header";
import LoadingIcon from "./app/components/LoadingIcon";
import { StaticRouter as Router } from "react-router-dom";
import StateContext from "./app/StateContext";

function Shell() {
  return (
    <StateContext.Provider value={{ loggedIn: false }}>
      <Router>
        <Header staticEmpty={true} />
        <div className="py-5 my-5 text-center">
          <LoadingIcon />
        </div>
        <Footer />
      </Router>
    </StateContext.Provider>
  );
}

function html(x) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>OurApp</title>
      <link href="https://fonts.googleapis.com/css?family=Public+Sans:300,400,400i,700,700i&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />
      <script defer src="https://use.fontawesome.com/releases/v5.5.0/js/all.js" integrity="sha384-GqVMZRt5Gn7tB9D9q7ONtcp4gtHIUEW/yG7h98J7IpE3kpi+srfFyyB/04OV6pG0" crossorigin="anonymous"></script>

      <link rel="stylesheet" href="/main.css" />
    </head>
    <body>
      <div id="root">
      ${x}
      </div>
    </body>
  </html>
  `;
}

/*
  We can use ReactDomServer (you can see how we imported
  that at the very top of this file) to generate a string
  of HTML text. We simply give it a React component and
  here we are using the JSX syntax.
*/
const reactHtml = ReactDOMServer.renderToString(<Shell />);

/*
  Call our "html" function which has the skeleton or
  boilerplate HTML, and give it the string that React
  generated for us. Our "html" function will insert
  the React string inside the #app div. So now we will
  have a variable in memory with the exact string we
  want, we just need to save it to a file.
*/
const overallHtmlString = html(reactHtml);

/*
  This course is not about Node, but here we are simply
  saving our generated string into a file named
  index-template.html. Please note that this Node task
  will fail if the directory we told it to live within
  ("app" in this case) does not already exist.
*/
const fileName = "./app/index-template.html";
const stream = fs.createWriteStream(fileName);
stream.once("open", () => {
  stream.end(overallHtmlString);
});
```

package.json  
```
"scripts": {
    "dev": "npm-run-all -s generate webpackDev",
    "webpackDev": "webpack-dev-server",
    "build": "npm-run-all -s generate webpackBuild",
    "webpackBuild": "webpack",
    "generate": "babel-node --presets=@babel/preset-react,@babel/preset-env generateHtml.js",
    "previewDist": "node previewDist",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
  ```

//here npm-run-all is node package, -s to sequentially run scripts  
//npm run webpackDev for development  
//npm run webpackBuild for production -> npm run previewDist to view
