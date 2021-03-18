mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',  // Id of the div tag used to render the map, in our case the id is "map"
    style: 'mapbox://styles/mapbox/light-v10',
    center: campground.geometry.coordinates,
    // center: [10,56],
    zoom: 10
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        //Offset is the distance of the popup from the pin or marker
        new mapboxgl.Popup({ offset: 25, closeOnClick: true })
            .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map);
// const marker = new mapboxgl.Marker().setLngLat([10, 56]).addTo(map);