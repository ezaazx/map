const socket = io();
console.log('Socket.io client script loaded');

socket.on('connect', () => {
  console.log('Socket.io connected');
});


if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      socket.emit('send-location', { latitude, longitude, accuracy });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
} else {
  alert('Geolocation is not supported by this browser.');
}

const map = L.map('map').setView([0, 0], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'OpenStreetMap',
}).addTo(map);


const markers = {};
const circles = {};

socket.on('receive-location', (data) => {
  const { id, latitude, longitude, accuracy } = data;

  map.setView([latitude, longitude]);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
    circles[id].setLatLng([latitude, longitude]);
    circles[id].setRadius(accuracy*0.3);
  } else {
    
    markers[id] = L.marker([latitude, longitude]).addTo(map);
    circles[id] = L.circle([latitude, longitude], {
      radius: accuracy*0.3,
      color: 'blue',
      opacity: 0.3,
      fillOpacity: 0.1,
    }).addTo(map);
  }
});

socket.on('user-disconnected', (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
  if (circles[id]) {
    map.removeLayer(circles[id]);
    delete circles[id];
  }
});
