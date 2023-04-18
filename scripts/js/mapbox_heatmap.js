function initializeMaps() {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsaW5nb2Z0ZWRhbCIsImEiOiJjbGdtdjV4YWowOWpzM2xvZWc1cmY3YmR1In0.DNvdC-JdrVZdItHSmZUapg';

  const globalMap = new mapboxgl.Map({
    container: 'global-map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [0, 0], // starting position [lng, lat]
    zoom: 2, // starting zoom
  });

  const localMap = new mapboxgl.Map({
    container: 'local-map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [8.4689, 60.4720], // starting position [lng, lat]
    zoom: 5, // starting zoom
  });

  globalMap.on('load', () => {
    Papa.parse('../scripts/nrk/global/results/countries_output.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data;
        const globalGeoJSON = csvToGeoJSON(data);

        globalMap.addSource('global-heatmap-source', {
          type: 'geojson',
          data: globalGeoJSON,
        });

        addHeatmapLayer(globalMap, 'global-heatmap-source');
      },
    });
  });

  localMap.on('load', () => {
    Papa.parse('../scripts/nrk/inland/results/innland_output.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data;
        const localGeoJSON = csvToGeoJSON(data);

        localMap.addSource('local-heatmap-source', {
          type: 'geojson',
          data: localGeoJSON,
        });

        addHeatmapLayer(localMap, 'local-heatmap-source');
      },
    });
  });
}

function addHeatmapLayer(map, source) {
  map.addLayer({
    id: source + '-heatmap',
    type: 'heatmap',
    source: source,
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
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMaps();
});
