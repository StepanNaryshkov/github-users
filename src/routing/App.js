import React, { useReducer } from "react";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import { IsAuthUser } from './IsAuthUser';
import { IsNotAuthUser } from './IsNotAuthUser';
import { Login } from './../screens/Login/Login';
import { Home } from './../screens/Home/Home';
import { userInitialState, userReducer } from '../store/user/user'
import { filmInitialState, filmReducer } from '../store/film/film'

export const UserContext = React.createContext();
export const UserDispatch  = React.createContext();
export const FilmContext  = React.createContext();
export const FilmDispatch  = React.createContext();

export default function App() {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [filmState, filmDispatch] = useReducer(filmReducer, filmInitialState);
  return (
    <UserContext.Provider value={userState}>
      <UserDispatch.Provider value={userDispatch}>
        <FilmContext.Provider value={filmState}>
          <FilmDispatch.Provider value={filmDispatch}>

            <Router>
              <Switch>
                <IsNotAuthUser path="/" component={Login} exact />
                <IsAuthUser path="/home" component={Home} />
              </Switch>

            </Router>
          </FilmDispatch.Provider>
        </FilmContext.Provider>
      </UserDispatch.Provider>
    </UserContext.Provider>
  );
}
