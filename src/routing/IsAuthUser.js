import React, { useContext } from "react";
import {
  Route,
  Redirect
} from "react-router-dom";
import { UserContext } from '../routing/App';

export function IsAuthUser({ component: Component, ...rest }) {
  const { userName } = useContext(UserContext);

  return (
    <Route {...rest} render={(props) => (
      userName
        ? <Component {...props} />
        : <Redirect to='/' />
    )} />
  )
}
