import React, { Component } from 'react'
import './map.scss';
import { registerMap } from '../../utils/map-service';
import 'leaflet';
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';

export class Map extends Component {
  constructor (props) {
    super(props)
    this.mapRef = React.createRef();
  }

  componentDidMount () {
    const map = window.L.map('backgroundMap').setView([51.505, -0.09], 13);

    const googleSat = window.L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    });

    registerMap(map)

    googleSat.addTo(map)
  }

  render() {
    return (
      <div id="backgroundMap" className="background-map h-100 w-100" ref={this.mapRef} />
    )
  }
}
