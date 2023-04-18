mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [8.4689, 60.4720],
  zoom: 5
});

function csvToGeoJSON(csvData) {
  const geoJSONData = {
    type: 'FeatureCollection',
    features: [],
  };

  csvData.forEach((row) => {
    if (row.latitude && row.longitude) {
      geoJSONData.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
        },
        properties: {},
      });
    }
  });

  return geoJSONData;
}

function initializeMaps() {
  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

  const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [0, 0], // starting position [lng, lat]
    zoom: 2, // starting zoom
  });

  map.on('load', () => {
    // Global data map
    Papa.parse('../scripts/nrk/global/results/countries_output.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data;
        const globalGeoJSON = csvToGeoJSON(data);

        // Inland data map
        Papa.parse('../scripts/nrk/inland/results/innland_output.csv', {
          download: true,
          header: true,
          complete: (results) => {
            const data = results.data;
            const inlandGeoJSON = csvToGeoJSON(data);

            // Combine global and inland GeoJSON data
            const combinedGeoJSON = {
              type: 'FeatureCollection',
              features: globalGeoJSON.features.concat(inlandGeoJSON.features),
            };

            map.addSource('heatmap-source', {
              type: 'geojson',
              data: combinedGeoJSON,
            });

            map.addLayer({
              id: 'heatmap',
              type: 'heatmap',
              source: 'heatmap-source',
              paint: {
                'heatmap-weight': 1,
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(33,102,172,0)',
                  0.2,
                  'rgb(103,169,207)',
                  0.4,
                  'rgb(209,229,240)',
                  0.6,
                  'rgb(253,219,199)',
                  0.8,
                  'rgb(239,138,98)',
                  1,
                  'rgb(178,24,43)',
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
                'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0.5],
              },
            });
          },
        });
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMaps();
});

