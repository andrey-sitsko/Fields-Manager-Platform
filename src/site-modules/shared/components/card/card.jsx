import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import { withRouter } from 'react-router-dom';

import './card.scss';

export function CardUI({ className, hasBackBtn, hasCloseBtn, history, children }) {
  return (
    <div className={classnames('content-card round', className)}>
      {hasBackBtn &&
        <Button className="back-btn p-0 icon icon-back" color="link" onClick={history.goBack} />
      }
      {hasCloseBtn &&
        <Link to="/" className="close-btn icon icon-cross" />
      }
      {children}
    </div>
  );
}

CardUI.propTypes = {
  hasBackBtn: PropTypes.bool,
  hasCloseBtn: PropTypes.bool,
  className: PropTypes.string,
}

CardUI.defaultProps = {
  hasBackBtn: false,
  hasCloseBtn: false,
  className: null,
}

export const Card = withRouter(CardUI);