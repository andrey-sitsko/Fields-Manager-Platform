let setLocationCallback;

export function registerMapLocationCallback(callback) {
  setLocationCallback = callback;
}

export function setMapLocation(lat, long) {
  setLocationCallback(lat, long)
}