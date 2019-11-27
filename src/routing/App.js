import React, {useReducer} from "react";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import './index.css';
import {IsAuthUser} from './IsAuthUser';
import {IsNotAuthUser} from './IsNotAuthUser';
import {Error} from '../components/Error/Error';
import {Spinner} from '../components/Spinner/Spinner';
import {Login} from './../screens/Login/Login';
import {Home} from './../screens/Home/Home';
import {userInitialState, userReducer} from '../store/user/user';
import {filmInitialState, filmReducer} from '../store/film/film';
import {appInitialState, appReducer} from '../store/app/app';

export const UserContext = React.createContext();
export const UserDispatch = React.createContext();
export const FilmContext = React.createContext();
export const FilmDispatch = React.createContext();

export const AppDispatch = React.createContext();
export const AppContext = React.createContext();

export default function App() {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [filmState, filmDispatch] = useReducer(filmReducer, filmInitialState);
  const [appState, appDispatch] = useReducer(appReducer, appInitialState);
  const {isFetching} = appState;
  return (
    <UserContext.Provider value={userState}>
      <UserDispatch.Provider value={userDispatch}>
        <FilmContext.Provider value={filmState}>
          <FilmDispatch.Provider value={filmDispatch}>
            <AppContext.Provider value={appState}>
              <AppDispatch.Provider value={appDispatch}>

                <Router>
                  <Switch>
                    <IsNotAuthUser path="/" component={Login} exact />
                    <IsAuthUser path="/home" component={Home} />
                  </Switch>
                  <Error />
                  {isFetching && <Spinner />}
                </Router>

              </AppDispatch.Provider>
            </AppContext.Provider>
          </FilmDispatch.Provider>
        </FilmContext.Provider>
      </UserDispatch.Provider>
    </UserContext.Provider>
  );
}
