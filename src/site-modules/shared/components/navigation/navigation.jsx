import React, { Component } from 'react';
import classnames from 'classnames';
import Button from 'reactstrap/lib/Button';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import Input from 'reactstrap/lib/Input'
import { NavLink } from 'react-router-dom';
import {setMapLocation} from '../../utils/map-service'
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

  navigateToCurrent() {
    navigator.geolocation.getCurrentPosition(({coords: {latitude, longitude}}) => {
      setMapLocation(latitude, longitude)
    })
  }

  toggleLocationInput = () => {
    this.setState({locationInputOpened: !this.state.locationInputOpened})
  }

  render() {
    const { isBurgerOpen, locationInputOpened } = this.state;

    return (
      <div className="navigation position-fixed">
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

        <div className="navigation_button navigation_button__search bg-white round position-fixed d-flex align-items-center justify-content-center"
          onClick={this.toggleLocationInput}>
          <span className="icon icon-search" />
          <Input className={classnames('navigation_location-search' ,{"navigation_location-search__opened": locationInputOpened})} type="text"/>
        </div>
        <div className="navigation_button navigation_button__my-location bg-white round position-fixed d-flex align-items-center justify-content-center"
           onClick={this.navigateToCurrent}>
          <span className="icon icon-my-location" />
        </div>

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