import React, { Component, Fragment } from 'react'
import './map.scss';
import 'leaflet'
import 'leaflet-selectareafeature';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();
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
    // map.selectAreaFeature.enable({color: 'blue'});
    // map.selectAreaFeature.options.color = 'black'
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

  async searchAdreess({target: {value: addr}}) {
    const result = await provider.search({ query: addr });
    if(result.length) {
      map.setView([result[0].y, result[0].x], 17)
    }
  }

  render() {
    return (
      <Fragment>
        <div id="backgroundMap" className="background-map h-100 w-100" ref={this.mapRef} />
        <input type="text" onChange={this.searchAdreess} />
      </Fragment>
    )
  }
}
