const key = 'hMTdUv602spvwVDfuykt'; // Your MapTiler API key

// Initialize the map source using TileJSON
const source = new ol.source.TileJSON({
  url: `https://api.maptiler.com/maps/streets-v2/tiles.json?key=${key}`, // MapTiler TileJSON URL
  tileSize: 512,
  crossOrigin: 'anonymous',
});

// Initialize the map
const map = new ol.Map({
  target: 'map', // The id of the element to render the map
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    projection: 'EPSG:3857', // Ensure this matches your marker projection
    center: ol.proj.fromLonLat([106.660172, 10.762622]), // Default starting position [lng, lat]
    zoom: 13, // Starting zoom
  })
})

// Ensure map is globally accessible for other scripts
window.map = map;

map.getView().on('change:resolution', function() {
  map.render();
});