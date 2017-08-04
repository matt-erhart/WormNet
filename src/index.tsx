import * as React from "react";
import * as ReactDOM from "react-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {App} from './App'

const Root = () => {
  return (
    <MuiThemeProvider>
      <App/>
    </MuiThemeProvider>
  );
};

// render react DOM
document.body.style.backgroundColor = "black";
ReactDOM.render(<Root/>, document.getElementById("root"));
