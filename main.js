import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import configureStore from './redux/store';
import { Provider } from 'react-redux';

let initialState = {
   
}

let store = configureStore(initialState);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);