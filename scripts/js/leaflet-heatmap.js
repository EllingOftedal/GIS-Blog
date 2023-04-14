Papa.parse('../scripts/nrk/global/results/countries_output.csv', {
  download: true,
  header: true,
  complete: function (results) {
    const data = results.data;
    data.forEach(function (row) {
      globalHeatLayer.addLatLng([row.Latitude, row.Longitude]);
    });
  }
});

Papa.parse('../scripts/nrk/inland/results/innland_output.csv', {
  download: true,
  header: true,
  complete: function (results) {
    const data = results.data;
    data.forEach(function (row) {
      localHeatLayer.addLatLng([row.latitude, row.longitude]);
    });
  }
});
