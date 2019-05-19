import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Card } from '../shared/components/card/card';
import { getMap, setLocation } from '../shared/utils/map-service'
import axios from 'axios'
import './field-details.scss';
import classnames from 'classnames'

let mock = {
  "id": "2",
  "name": "Wheat",
  "square": 5.6,
  "suspiciousZone": 56,
  "fieldShape": [
    {
      "lat": 51.514631587576304,
      "lng": -0.1296043395996094
    },
    {
      "lat": 51.486223845664355,
      "lng": -0.1457061851397157
    },
    {
      "lat": 51.47922958822892,
      "lng": -0.0830841064453125
    },
    {
      "lat": 51.48849109416708,
      "lng": -0.019226074218750003
    },
    {
      "lat": 51.507373135789884,
      "lng": 0.0313796871341765
    },
    {
      "lat": 51.52193768456107,
      "lng": -0.010299682617187502
    },
    {
      "lat": 51.5424233564905,
      "lng": -0.05012512207031251
    },
    {
      "lat": 51.531268672483534,
      "lng": -0.07450103759765626
    },
    {
      "lat": 51.542949431188724,
      "lng": -0.09873963659629227
    },
    {
      "lat": 51.533774986527696,
      "lng": -0.12970735318958762
    }
  ]
}

export class FieldDetails extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      data: null,
    }
  }

  componentDidMount() {
    // ToDo add axios request
    setTimeout(async () => {
      this.setState({ data: mock })
      setLocation(mock.fieldShape[0].lat, mock.fieldShape[0].lng, 12)

      this.fieldLayer = new window.L.FeatureGroup();

      getMap().addLayer(this.fieldLayer);
      const polygon = window.L.polygon(mock.fieldShape.map(({lat, lng}) => [lat, lng]));
      this.fieldLayer.addLayer(polygon)

      const {data: weather} = await axios.get(`https://api.openweathermap.org/data/2.5/weather?appid=29e93815caecbaae939c0f3c29cd57d9&units=metric&lon=${mock.fieldShape[0].lng}&lat=${mock.fieldShape[0].lat}`)

      this.setState({
        temperature: weather.main.temp,
        humidity: weather.main.humidity,
        wind: weather.wind.speed,
        pressure: weather.main.pressure,
        weatherDescription: weather.weather[0].description
      })
    }, 0)
  }

  componentWillUnmount () {
    this.fieldLayer.remove();
  }

  render() {
    if (!this.state.data) {
      return null;
    }

    const { name, square, suspiciousZone } = this.state.data;

    return (
      <Card className="field-details-card" hasBackBtn hasCloseBtn>
        <div className="text-center medium mb-15">{name}</div>
        <Row>
          <Col xs={6} className="pr-25">
            <div className="font-weight-bold large text-black mb-15">Common Info</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Square</div>
              <div>{square}ha</div>
            </div>
            <div className="d-flex justify-content-between medium mb-30">
              <div className="text-gray">Suspicious zone</div>
              <div>{suspiciousZone}%</div>
            </div>
            <div className="font-weight-bold d-inline-block text-black large mb-15">Weather</div>
            <i className={classnames('icon float-right icon-weather-fallback', {
              'icon-cleat-sky': this.state.weatherDescription === 'clear sky',
              'icon-few-clouds': this.state.weatherDescription === 'few clouds',
              'icon-shattered-clouds': this.state.weatherDescription === 'scattered clouds',
              'icon-broken-cloud': this.state.weatherDescription === 'broken clouds',
              'icon-shower-rain': this.state.weatherDescription === 'shower rain',
              'icon-rain': this.state.weatherDescription === 'rain',
              'icon-snow': this.state.weatherDescription === 'snow',
              'icon-mist': this.state.weatherDescription === 'mist' || this.state.weatherDescription === 'haze',
              'icon-thunderstorm': this.state.weatherDescription === 'thunderstorm'
            })} />
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Temperature</div>
              <div>{this.state.temperature}</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Humidity</div>
              <div>{this.state.humidity}%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Wind</div>
              <div>{this.state.wind}m/s</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Pressure</div>
              <div>{this.state.pressure}mm</div>
            </div>
          </Col>
          <Col xs={6} className="pl-25">
            <div className="font-weight-bold text-black large mb-1">Composition</div>
            <div className="text-gray small mb-10">Last updated 01.02.2019</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Nitrogen</div>
              <div>24g</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Potassium</div>
              <div>40g</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Phosphorus</div>
              <div>30g</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Humus</div>
              <div>6%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Acidity</div>
              <div>5.5pH</div>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }
}
