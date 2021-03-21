import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "./index.css";
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import rootReducer from "./reducers/manageSendersReceivers";

import App from "./App";


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

let store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))

let subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract"

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache()
});

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
}

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
    <ThemeSwitcherProvider defaultTheme="dark" themeMap={themes} insertionPoint={document.getElementById('inject-styles-here')}>
        <App subgraphUri={subgraphUri}/>
    </ThemeSwitcherProvider>
    </ApolloProvider>
  </Provider>,
  document.getElementById("root"),
);
