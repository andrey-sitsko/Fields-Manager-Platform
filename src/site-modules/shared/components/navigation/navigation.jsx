import React, { Component } from 'react';
import classnames from 'classnames';
import Button from 'reactstrap/lib/Button';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import Input from 'reactstrap/lib/Input'
import { NavLink } from 'react-router-dom';
import {setLocation} from '../../utils/map-service'
import {searchAddress} from '../../utils/map-service'
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
    this.locationInputRef = React.createRef();

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
      setLocation(latitude, longitude)
    })
  }

  openLocationInput = () => {
    this.setState({locationInputOpened: true})
  }

  closeLocationInput = () => {
    this.setState({locationInputOpened: false})
    this.locationInputRef.current.value = ''
  }

  addressChange({target: {value: addr}}) {
    searchAddress(addr)
  }

  render() {
    const { isBurgerOpen, locationInputOpened } = this.state;

    return (
      <div className="navigation position-fixed">
        <Row tag="nav" className="nav-container round bg-white align-items-center">
          <Col tag={Button} className="burger-btn text-black border-0" color="link" onClick={this.toggleBurger}>
            {/* <i className={classnames('icon', { 'icon-cross': isBurgerOpen, 'icon-burger': !isBurgerOpen })} /> */}
            <div className={classnames('burger-icon', { open: isBurgerOpen })}>
              <span></span>
              <span></span>
              <span></span>
            </div>
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

        <div className="navigation_button navigation_button__my-location bg-white round position-fixed d-flex align-items-center justify-content-center"
             onClick={this.navigateToCurrent}>
          <span className="icon icon-my-location" />
        </div>
        <div className="navigation_button navigation_button__search bg-white round position-fixed d-flex align-items-center justify-content-center">
          <span className="icon icon-search w-100 h-100" onClick={this.openLocationInput}/>
          <Input onChange={this.addressChange} innerRef={this.locationInputRef} className={classnames('navigation_location-search round', {"navigation_location-search__opened": locationInputOpened})} type="text" placeholder="Search for location"/>
          <span onClick={this.closeLocationInput} className={classnames('icon icon-cross navigation_location-cross-icon w-100 h-100', {"navigation_location-cross-icon__opened": locationInputOpened})} />
        </div>

        {isBurgerOpen && 
          <Row tag="nav" className="flex-column burger-menu round bg-white px-0">
            {
              menuItems.map(({ label, href, iconClass }) => 
                <Col className="h-100 nav-link px-20 py-10" onClick={this.closeBurger} tag={NavLink} key={href} to={href}>
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