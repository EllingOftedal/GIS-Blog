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

  function addWeightedLatLng(heatLayer, lat, lng, count, maxCount) {
    const normalizedWeight = count / maxCount;
    heatLayer.addLatLng([lat, lng, normalizedWeight]);
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
    maxOpacity: 0.4
  }).addTo(globalMap);

  var localMap = L.map('local-map').setView([60.4720, 8.4689], 5);
  var localLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(localMap);
  var localHeatLayer = L.heatLayer([], {
    radius: 25,
    gradient: {0.0: '#00ccff', 0.5: '#ff9900', 1.0: '#ff0000'},
    maxOpacity: 0.4
  }).addTo(localMap);

  globalMap.on('zoomend', function () {
    updateHeatmapRadius(globalMap, globalHeatLayer);
  });

  localMap.on('zoomend', function () {
    updateHeatmapRadius(localMap, localHeatLayer);
  });

  Papa.parse('../scripts/nrk/global/results/countries_summarized.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const maxCount = getMaxCount(data);
      data.forEach(function (row) {
        if (row.latitude && row.longitude && row.count) {
          const count = parseInt(row.count, 10);
          addWeightedLatLng(globalHeatLayer, parseFloat(row.latitude), parseFloat(row.longitude), count, maxCount);
        } else {
          console.warn('Invalid data:', row);
        }
      });
    }
  });

  Papa.parse('../scripts/nrk/inland/results/innland_summarized.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const maxCount = getMaxCount(data);
      data.forEach(function (row) {
        if (row.latitude && row.longitude && row.count) {
          const count = parseInt(row.count, 10);
          addWeightedLatLng(localHeatLayer, parseFloat(row.latitude), parseFloat(row.longitude), count, maxCount);
        } else {
          console.warn('Invalid data:', row);
        }
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeMaps);
