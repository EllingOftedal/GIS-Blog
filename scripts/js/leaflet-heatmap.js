<script>
  function initializeMaps() {
    var globalMap = L.map('global-map').setView([0, 0], 2);
    var globalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(globalMap);
    var globalHeatLayer = L.heatLayer([], {radius: 25}).addTo(globalMap);

    var localMap = L.map('local-map').setView([60.4720, 8.4689], 5);
    var localLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(localMap);
    var localHeatLayer = L.heatLayer([], {radius: 25}).addTo(localMap);

    Papa.parse('../scripts/nrk/global/results/countries_output.csv', {
      download: true,
      header: true,
      complete: function (results) {
        const data = results.data;
        data.forEach(function (row) {
          if (row.Latitude && row.Longitude) {
            globalHeatLayer.addLatLng([row.Latitude, row.Longitude]);
          } else {
            console.warn('Invalid data:', row);
          }
        });
      }
    });

    Papa.parse('../scripts/nrk/inland/results/innland_output.csv', {
      download: true,
      header: true,
      complete: function (results) {
        const data = results.data;
        data.forEach(function (row) {
          if (row.latitude && row.longitude) {
            localHeatLayer.addLatLng([row.latitude, row.longitude]);
          } else {
            console.warn('Invalid data:', row);
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initializeMaps);
</script>
