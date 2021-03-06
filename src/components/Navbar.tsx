import React, { Fragment } from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import { CustomButton, Image, AppContextConsumer } from './';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router';
import { NavbarItem } from '../types';
import { removeLoggedInLocalStorage } from '../utils';
import { alertSuccessful } from '../utils';

interface _NavbarProps {
  items: NavbarItem[];
}

type Props = _NavbarProps & RouteComponentProps;

const _Navbar = (props: Props): JSX.Element => {
  const classes = useStyles();
  const { items, location } = props;
  console.log('location', location);

  const renderItems = (): JSX.Element[] => {
    return items.map(
      (item): JSX.Element => {
        const { label, route } = item;
        return (
          <Link className={classes.link} to={`${route}`} key={label}>
            <CustomButton color="secondary" label={label} variant="text" />
          </Link>
        );
      }
    );
  };

  const renderUploadButton = (): JSX.Element => {
    return (
      <Link className={classes.link} to="/upload">
        <CustomButton color="secondary" label="Upload" />
      </Link>
    );
  };

  const renderAdminLoginButton = (): JSX.Element => {
    return (
      <Link className={classes.link} to="/login">
        <CustomButton color="secondary" label="Admin Login" />
      </Link>
    );
  };

  return (
    <AppContextConsumer>
      {(context) => (
        <Fragment>
          <AppBar position="static">
            <Toolbar className={classes.container}>
              <div>
                <Image src={'/camera.svg'} size="icon" alt="camera" />
              </div>
              <div>
                {context &&
                  context.state.loggedIn &&
                  location.pathname !== '/upload' &&
                  renderUploadButton()}
                {context &&
                  !context.state.loggedIn &&
                  location.pathname !== '/login' &&
                  renderAdminLoginButton()}
                {renderItems()}
                {context && context.state.loggedIn && (
                  <CustomButton
                    label="Log out"
                    onClick={() => {
                      context.updateState.toggleLogin();
                      removeLoggedInLocalStorage();
                      return alertSuccessful('Successfully logged out.');
                    }}
                    variant="text"
                  />
                )}
              </div>
            </Toolbar>
          </AppBar>
        </Fragment>
      )}
    </AppContextConsumer>
  );
};

export const Navbar = withRouter(_Navbar);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      justifyContent: 'space-between'
    },
    link: {
      textDecoration: 'none'
    }
  })
);
