// Fetch data from PHP backend
fetch('data.php')  // Replace with your actual PHP script for fetching data
  .then(response => response.json())
  .then(data => {
    // Check if the data is an array of markers
    if (Array.isArray(data)) {
      // Clear existing markers if necessary
      map.getOverlays().clear();

      // Iterate over each data item and create a marker
      data.forEach(item => {
        const { longitude, latitude, height, status } = item;

        if (longitude !== undefined && latitude !== undefined) {
          // Create the marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'marker';

          // Assign a class based on status
          switch (status) {
            case 0:
              markerElement.classList.add('red');
              break;
            case 1:
              markerElement.classList.add('green');
              break;
            case 2:
              markerElement.classList.add('blue');
              break;
            default:
              markerElement.classList.add('red');  // Default color
          }

          // Create a label for the height
          const labelElement = document.createElement('div');
          labelElement.className = 'marker-label';
          labelElement.innerText = `${height.toFixed(2)} m`;  // Display height

          // Wrap marker and label in a container
          const markerContainer = document.createElement('div');
          markerContainer.style.position = 'relative';
          markerContainer.appendChild(markerElement);
          markerContainer.appendChild(labelElement);

          // Create an OpenLayers overlay for the marker
          const marker = new ol.Overlay({
            position: ol.proj.fromLonLat([longitude, latitude]),
            positioning: 'center-center',
            element: markerContainer,
            stopEvent: false,
          });
          map.addOverlay(marker);
        } else {
          console.error('Invalid data received from server.');
        }
      });
    } else {
      console.error('Unexpected data format received from server.');
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
