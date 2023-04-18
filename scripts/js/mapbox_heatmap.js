mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsaW5nb2Z0ZWRhbCIsImEiOiJjbGdtdjV4YWowOWpzM2xvZWc1cmY3YmR1In0.DNvdC-JdrVZdItHSmZUapg';

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
  const globalMap = new mapboxgl.Map({
    container: 'global-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 2
  });

  const localMap = new mapboxgl.Map({
    container: 'local-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [8.4689, 60.4720],
    zoom: 5
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

        globalMap.addLayer({
          id: 'global-heatmap',
          type: 'heatmap',
          source: 'global-heatmap-source',
          paint: {
            // Add the heatmap-color property here
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(33,102,172,0)',
              0.1,
              'rgb(103,169,207)',
              0.3,
              'rgb(209,229,240)',
              0.5,
              'rgb(253,219,199)',
              0.7,
              'rgb(239,138,98)',
              0.9,
              'rgb(178,24,43)',
            ],
        });
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

        localMap.addLayer({
          id: 'local-heatmap',
          type: 'heatmap',
          source: 'local-heatmap-source',
          paint: {
            // Add the heatmap-color property here
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(33,102,172,0)',
              0.1,
              'rgb(103,169,207)',
              0.3,
              'rgb(209,229,240)',
              0.5,
              'rgb(253,219,199)',
              0.7,
              'rgb(239,138,98)',
              0.9,
              'rgb(178,24,43)',
            ],
        });
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMaps();
});
