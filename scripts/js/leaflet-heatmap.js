function addLatLng(heatLayer, lat, lng) {
  heatLayer.addData({ x: lat, y: lng });
}

function initializeMaps() {
  var globalMap = L.map('global-map').setView([0, 0], 2);
  var globalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(globalMap);

  var localMap = L.map('local-map').setView([60.4720, 8.4689], 5);
  var localLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(localMap);

  var globalHeatLayer = new HeatmapOverlay({
    radius: 1,
    maxOpacity: 0.4,
    scaleRadius: true,
    useLocalExtrema: false,
    latField: 'x',
    lngField: 'y'
  }).addTo(globalMap);

  var localHeatLayer = new HeatmapOverlay({
    radius: 1,
    maxOpacity: 0.4,
    scaleRadius: true,
    useLocalExtrema: false,
    latField: 'x',
    lngField: 'y'
  }).addTo(localMap);

  // Global data map
  Papa.parse('../scripts/nrk/global/results/raw_data.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      data.forEach(function (row) {
        if (row.latitude && row.longitude) {
          addLatLng(globalHeatLayer, parseFloat(row.latitude), parseFloat(row.longitude));
        } else {
          console.warn('Invalid data:', row);
        }
      });
    }
  });

  // Norway inland data map
  Papa.parse('../scripts/nrk/inland/results/raw_data.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      data.forEach(function (row) {
        if (row.latitude && row.longitude) {
          addLatLng(localHeatLayer, parseFloat(row.latitude), parseFloat(row.longitude));
        } else {
          console.warn('Invalid data:', row);
        }
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMaps();
});
