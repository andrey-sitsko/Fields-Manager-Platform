import React, { Component } from 'react';
import classnames from 'classnames';
import Button from 'reactstrap/lib/Button';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { NavLink } from 'react-router-dom';

import './navigation.scss';

const menuItems = [
  {
    label: 'Fields',
    href: '/my-fields',
    iconClass: 'icon-plant',
    isPrimary: true,
  },
  {
    label: 'Statistics',
    href: '/statistics',
    iconClass: 'icon-stats',
    isPrimary: true,
  },
  {
    label: 'Resources',
    href: '/my-resources',
    iconClass: 'icon-tractor',
    isPrimary: true,
  },
  {
    label: 'Settings',
    href: '/settings',
    iconClass: 'icon-settings',
    isPrimary: true,
  },
  {
    label: 'History Book',
    href: '/history',
    iconClass: 'icon-scroll',
  },
  {
    label: 'Profile',
    href: '/profile',
    iconClass: 'icon-farmer',
  }
]

export class Navigation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isBurgerOpen: false,
    }
  }

  toggleBurger = () => {
    this.setState({ isBurgerOpen: !this.state.isBurgerOpen });
  }

  closeBurger = () => {
    this.setState({ isBurgerOpen: false });
  }

  render() {
    const { isBurgerOpen } = this.state;

    return (
      <div className="navigation position-fixed w-100 h-100">
        <div className="nav-overlay" />
        <Row tag="nav" className="nav-container round bg-white align-items-center">
          <Col tag={Button} className="burger-btn p-4 text-black border-0" color="link" onClick={this.toggleBurger}>
            <i className={classnames('icon', { 'icon-cross': isBurgerOpen, 'icon-burger': !isBurgerOpen })} />
          </Col>
          {
            menuItems.map(({ label, href, isPrimary }) => isPrimary && 
              <Col className="h-100 nav-link px-3" tag={NavLink} onClick={this.closeBurger} key={href} to={href} activeClassName="bg-black text-white">
                {label}
              </Col>
            )
          }
          <div className="user-photo icon-user mx-3" />
        </Row>

        {isBurgerOpen && 
          <Row tag="nav" className="flex-column burger-menu round bg-white">
            {
              menuItems.map(({ label, href, iconClass }) => 
                <Col className="h-100 nav-link" onClick={this.closeBurger} tag={NavLink} key={href} to={href}>
                  <i className={`icon float-left mr-2 ${iconClass}`} /> {label}
                </Col>
              )
            }
          </Row>
        }
      </div>
    )
  }
}