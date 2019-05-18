import React, { Component, Fragment } from 'react'
import './map.scss';
import 'leaflet'
import 'leaflet-selectareafeature';
import { registerMap } from '../../utils/map-service'

let map;

export class Map extends Component {
  constructor (props) {
    super(props)
    this.mapRef = React.createRef();
  }

  componentDidMount () {
    map = window.L.map('backgroundMap').setView([51.505, -0.09], 13);

    const googleSat = window.L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    });

    googleSat.addTo(map)

    registerMap(map)
  }

  getSelection() {
    console.log(JSON.stringify(map.selectAreaFeature.getAreaLatLng()))
  }

  enableSelect() {
    map.selectAreaFeature.enable({color: 'blue'});
    map.selectAreaFeature.options.color = 'black'

    this.mapRef.current.addEventListener('click', () => {
      map.removeAllArea();
    })
  }

  render() {
    return (
      <div id="backgroundMap" className="background-map h-100 w-100" ref={this.mapRef} />
    )
  }
}
