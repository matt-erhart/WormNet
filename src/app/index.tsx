import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { Router, Route, Switch } from 'react-router';
import { TodoApp } from './containers/TodoApp';
import { TodoModel } from './models/TodoModel';
import { TodoStore, RouterStore } from './stores';
import { STORE_TODO, STORE_ROUTER } from './constants/stores';
import { TodoFilter } from './constants/todos';
import { App } from './App';

// enable MobX strict mode
useStrict(true);

// default fixtures for TodoStore
const defaultTodos = [
  new TodoModel('Use Mobx'),
  new TodoModel('Use React', true),
];

// prepare MobX stores
const history = createBrowserHistory();
const todoStore = new TodoStore(defaultTodos);
const routerStore = new RouterStore(history);
const rootStores = {
  [STORE_TODO]: todoStore,
  [STORE_ROUTER]: routerStore
};

export class AddDevTools extends React.Component<any, any> {

  renderDevTool() {
    if (process.env.NODE_ENV !== 'production') {
      const DevTools = require('mobx-react-devtools').default;
      return (<DevTools />);
    }
  };

  render() {
    return (
      <div className="container">
        {this.props.children}
        {this.renderDevTool()}
      </div>
    );
  }
};

// render react DOM
ReactDOM.render(
  <Provider {...rootStores} >
    <AddDevTools>
      <Router history={history} >
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </Router>
    </AddDevTools>
  </Provider >,
  document.getElementById('root')
);