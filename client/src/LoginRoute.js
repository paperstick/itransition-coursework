import React from "react";
import { Route, Redirect } from "react-router-dom";
import { withRouter } from "react-router";

function LoginRoute({ component: Component, handleSuccessfulAuth, handleLogin, user, ...rest }) {
  return (
    <Route {...rest}
      render={props => {
        if (user === undefined) {
          return <Component handleSuccessfulAuth={handleSuccessfulAuth}
            handleLogin={handleLogin}
            user={user}
            {...props} />;
        } else {
          return (
            <Redirect to="/" />
          );
        }
      }}
    />
  );
};

export default withRouter(LoginRoute);
