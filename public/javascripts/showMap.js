mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',  // Id of the div tag used to render the map, in our case the id is "map"
    style: 'mapbox://styles/mapbox/streets-v11',
    center: campground.geometry.coordinates,
    // center: [10,56],
    zoom: 10
});

const marker = new mapboxgl.Marker().setLngLat(campground.geometry.coordinates).addTo(map);
// const marker = new mapboxgl.Marker().setLngLat([10, 56]).addTo(map);