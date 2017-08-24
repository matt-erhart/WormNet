import * as React from "react";
import * as ReactDOM from "react-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
var Perf = require("react-addons-perf"); // ES5 with npm
(window as any).Perf = Perf;

var firebase = require("firebase");
var config = {
  apiKey: "AIzaSyA5VLHWzUklgmXGQSx51mOvHWx68fTGVp8",
  authDomain: "wormnet-19cea.firebaseapp.com",
  databaseURL: "https://wormnet-19cea.firebaseio.com",
  projectId: "wormnet-19cea",
  storageBucket: "wormnet-19cea.appspot.com",
  messagingSenderId: "274364698408"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
export var storage = firebase.storage();
export var database = firebase.database();

import { App } from "./App";

const Root = () => {
  return (
    <MuiThemeProvider>
      <App />
    </MuiThemeProvider>
  );
};

// render react DOM
document.body.style.backgroundColor = "black";
ReactDOM.render(<Root />, document.getElementById("root"));
