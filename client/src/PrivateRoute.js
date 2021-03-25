import React from "react";
import { Route, Redirect } from "react-router-dom";
import { withRouter } from "react-router";

function PrivateRoute({ component: Component, handleLogout, user, role, ...rest }) {
  return (
    <Route {...rest}
      render={props => {
        if (user && role === 'admin') {
          return <Component handleLogout={handleLogout}
            user={user}
            {...props} />;
        } else {
          return (
            <Redirect to="/login" />
          );
        }
      }}
    />
  );
};

export default withRouter(PrivateRoute);
