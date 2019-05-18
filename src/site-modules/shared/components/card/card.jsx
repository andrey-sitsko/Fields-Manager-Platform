import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import { withRouter } from 'react-router-dom';

import './card.scss';

export function CardUI({ hasBackBtn, hasCloseBtn, history, children }) {
  return (
    <div className="content-card round">
      {hasBackBtn &&
        <Button className="back-btn p-0 icon icon-back" color="link" onClick={history.goBack} />
      }
      {hasCloseBtn &&
        <Link to="/" className="close-btn icon icon-cross2" />
      }
      {children}
    </div>
  );
}

CardUI.propTypes = {
  hasBackBtn: PropTypes.bool,
  hasCloseBtn: PropTypes.bool,
}

CardUI.defaultProps = {
  hasBackBtn: false,
  hasCloseBtn: false,
}

export const Card = withRouter(CardUI);