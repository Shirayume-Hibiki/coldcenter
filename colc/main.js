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
      source: source,
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([106.660172, 10.762622]), // Default starting position [lng, lat]
    zoom: 9, // Starting zoom
  })
})