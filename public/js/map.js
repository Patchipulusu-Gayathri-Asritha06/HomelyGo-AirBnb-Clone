mapboxgl.accessToken = mapToken;
console.log(mapToken);

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.on('load', () => {
    // Load an image from an external URL.
    map.loadImage(
        '/images/marker.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('custom-marker', image);
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': listing.geometry.coordinates
                        }
                    }]
                }
            });

            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'point', // reference the data source
                'layout': {
                    'icon-image': 'custom-marker', // reference the image
                    'icon-size': 0.4
                }
            });

            const popup = new mapboxgl.Popup({
                offset: 25,
                maxWidth: "300px"
            }).setHTML(`
                <span style="font-size:medium">${listing.title}</span>
            `);

            map.on('click', 'points', (e) => {
                popup.setLngLat(e.features[0].geometry.coordinates).addTo(map);
            });

            map.on('mouseenter', 'points', () => {
                map.getCanvas().style.cursor = 'default';
            });
            map.on('mouseleave', 'points', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    )
});