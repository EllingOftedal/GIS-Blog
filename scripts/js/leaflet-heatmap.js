function updateHeatmapRadius(map, heatLayer) {
  const baseRadius = 50;
  const currentZoom = map.getZoom();
  const newRadius = baseRadius * currentZoom;
  heatLayer.setOptions({ radius: newRadius });
}

function isValidData(row) {
  return row.latitude && row.longitude;
}

function initializeMaps() {
  var globalMap = L.map('global-map').setView([0, 0], 2);
  var globalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(globalMap);
  var globalHeatLayer = L.heatLayer([], {
    radius: 50,
    gradient: {0.0: '#00ccff', 0.5: '#ff9900', 1.0: '#ff0000'},
    maxOpacity: 0.4
  }).addTo(globalMap);

  var localMap = L.map('local-map').setView([60.4720, 8.4689], 5);
  var localLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(localMap);
  var localHeatLayer = L.heatLayer([], {
    radius: 50,
    gradient: {0.0: '#00ccff', 0.5: '#ff9900', 1.0: '#ff0000'},
    maxOpacity: 0.4
  }).addTo(localMap);

  globalMap.on('zoomend', function () {
    updateHeatmapRadius(globalMap, globalHeatLayer);
  });

  localMap.on('zoomend', function () {
    updateHeatmapRadius(localMap, localHeatLayer);
  });

  // Global data map
  Papa.parse('../scripts/nrk/global/results/countries_output.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      let points = [];
      data.forEach(function (row) {
        if (isValidData(row)) {
          points.push([parseFloat(row.latitude), parseFloat(row.longitude)]);
        } else {
          console.warn('Invalid data:', row);
        }
      });
      globalHeatLayer.setLatLngs(points);
    }
  });

  // Norway inland data map
  Papa.parse('../scripts/nrk/inland/results/innland_output.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      let points = [];
      data.forEach(function (row) {
        if (isValidData(row)) {
          points.push([parseFloat(row.latitude), parseFloat(row.longitude)]);
        } else {
          console.warn('Invalid data:', row);
        }
      });
      localHeatLayer.setLatLngs(points);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMaps();
});
