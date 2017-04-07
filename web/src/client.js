
	"use strict";

	import React from 'react';
	import { render, unmountComponentAtNode } from 'react-dom';
	import createHistory from 'history/createBrowserHistory';
	import { ConnectedRouter } from 'react-router-redux';
	import { Provider } from 'react-redux';
	import { BrowserRouter, Route } from 'react-router-dom';

	import configureStore from './redux/store';

	import App from './containers/App'

	// Get initial state from server-side rendering
	const initialState = window.__INITIAL_STATE__ || {};
	const history = createHistory();
	const store = configureStore(history, initialState);
	const mountNode = document.getElementById('react-view');

	render(
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ConnectedRouter>
		</Provider>,
		mountNode,
	);