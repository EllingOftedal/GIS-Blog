Papa.parse('../scripts/nrk/global/results/countries_output.csv', {
  download: true,
  header: true,
  complete: function (results) {
    const data = results.data;
    console.log('Global data:', data);
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
    console.log('Local data:', data);
    data.forEach(function (row) {
      if (row.latitude && row.longitude) {
        localHeatLayer.addLatLng([row.latitude, row.longitude]);
      } else {
        console.warn('Invalid data:', row);
      }
    });
  }
});
