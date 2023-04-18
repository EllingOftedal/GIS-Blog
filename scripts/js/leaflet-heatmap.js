function updateHeatmapRadius(map, heatLayer) {
  const baseRadius = 25;
  const currentZoom = map.getZoom();
  const newRadius = baseRadius * currentZoom;
  heatLayer.setOptions({ radius: newRadius });
}

function getMaxCount(data) {
  let maxCount = 0;
  data.forEach(function (row) {
    const count = parseInt(row.count, 10);
    if (count > maxCount) {
      maxCount = count;
    }
  });
  return maxCount;
}

function isValidData(row) {
  return row.latitude && row.longitude && row.count;
}

function initializeMaps() {
  var globalMap = L.map('global-map').setView([0, 0], 2);
  var globalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(globalMap);
  var globalHeatLayer = L.heatLayer([], {
    radius: 25,
    gradient: {0.0: '#00ccff', 0.5: '#ff9900', 1.0: '#ff0000'},
    maxOpacity: 0.4,
  }).addTo(globalMap);

  var localMap = L.map('local-map').setView([60.4720, 8.4689], 5);
  var localLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(localMap);
  var localHeatLayer = L.heatLayer([], {
    radius: 25,
    gradient: {0.0: '#00ccff', 0.5: '#ff9900', 1.0: '#ff0000'},
    maxOpacity: 0.4,
  }).addTo(localMap);

  globalMap.on('zoomend', function () {
    updateHeatmapRadius(globalMap, globalHeatLayer);
  });

  localMap.on('zoomend', function () {
    updateHeatmapRadius(localMap, localHeatLayer);
  });

  // Global data map
  Papa.parse('scripts/nrk/global/results/countries_summarized.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const globalMaxCount = getMaxCount(data);
      data.forEach(function (row) {
        if (isValidData(row)) {
          const count = parseInt(row.count, 10);
          const normalizedWeight = count / globalMaxCount;
          globalHeatLayer.addLatLng([parseFloat(row.latitude), parseFloat(row.longitude), normalizedWeight]);
        } else {
          console.warn('Invalid data:', row);
        }
      });
    }
  });

  // Norway inland data map
  Papa.parse('scripts/nrk/inland/results/innland_summarized.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const inlandMaxCount = getMaxCount(data);
      data.forEach(function (row) {
        if (isValidData(row)) {
          const count = parseInt(row.count, 10);
          const normalizedWeight = count / inlandMaxCount;
          localHeatLayer.addLatLng([parseFloat(row.latitude), parseFloat(row.longitude), normalizedWeight]);
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
