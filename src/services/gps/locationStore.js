let currentLocation = "Detectando...";
const listeners = new Set();

export function setLocation(lugar) {
  currentLocation = lugar;
  listeners.forEach((l) => l(lugar));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLocation() {
  return currentLocation;
}
