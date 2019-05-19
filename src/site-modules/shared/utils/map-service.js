import { OpenStreetMapProvider } from 'leaflet-geosearch'

const provider = new OpenStreetMapProvider();
let map;

export function setLocation(lat, long, zoom = 18) {
  if (lat && long) {
    map.setView([lat, long], zoom)
  }
}

export async function searchAddress(addr) {
  const result = await provider.search({ query: addr });
  if(result.length) {
    setLocation(result[0].y, result[0].x)
  }
}

export async function enableDraw() {
  map.pm.enableDraw('Polygon', {  });
}

export async function disableDraw() {
  map.pm.disableDraw('Polygon');
}

export function getMap() {
  return map;
}

export function registerMap(_map) {
  map = _map;
}

export function drawField(coordinates) {
  // map.
}
