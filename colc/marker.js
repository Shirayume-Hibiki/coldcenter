// Store markers using userID as the key to avoid recreating them every second
const markersMap = new Map();

// Function to fetch and update markers on the map
function fetchAndAddMarkers() {
  fetch('https://coldcenter.space/data.php')
    .then(response => response.json())
    .then(responseData => {
      const { data, serverTime } = responseData;
      const currentTime = Number(serverTime);
      const timeout = 2 * 60; // 2 minutes in seconds
      const disconnectDetection = 60; // 1 minute in seconds

      // Check if data is not empty
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const { longitude, latitude, height, status, lastUpdate, userID } = item;

          // Convert lastUpdate to seconds if necessary
          const lastUpdateTime = Number(lastUpdate);
          if (isNaN(lastUpdateTime)) {
            console.warn('Invalid lastUpdate for item:', item);
            return;
          }

          // Determine marker status based on the last update time
          if (currentTime - lastUpdateTime < disconnectDetection) {
            // Active within 1 minute
            addOrUpdateMarker(longitude, latitude, height, status, userID);
          } else if (currentTime - lastUpdateTime >= disconnectDetection && currentTime - lastUpdateTime <= timeout) {
            // Disconnected but within timeout period
            addOrUpdateMarker(longitude, latitude, height, 3, userID); // Gray status for disconnection
          } else if (currentTime - lastUpdateTime > timeout) {
            // Remove marker after timeout
            removeMarker(userID);
          }
        });
      } else {
        console.log('No data to display.');
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Function to add or update a marker on the map
function addOrUpdateMarker(longitude, latitude, height, status, userID) {
  if (longitude === undefined || latitude === undefined) {
    console.error('Invalid marker data:', { longitude, latitude, height, status, userID });
    return;
  }

  // Check if marker already exists
  if (!markersMap.has(userID)) {
    // Create a new marker
    const markerElement = createMarkerElement(height, status, userID);
    const marker = new ol.Overlay({
      position: ol.proj.fromLonLat([longitude, latitude]),
      positioning: 'bottom-center', // Align bottom of marker to coordinates
      element: markerElement,
      stopEvent: false,
    });

    // Add marker to the map
    if (window.map) {
      window.map.addOverlay(marker);
      markersMap.set(userID, marker); // Store marker in the map
    } else {
      console.error('Map is not initialized.');
    }
  } else {
    // Update existing marker position and status
    const marker = markersMap.get(userID);
    marker.setPosition(ol.proj.fromLonLat([longitude, latitude]));

    // Update the marker appearance if status or height changes
    const markerElement = marker.getElement();
    updateMarkerAppearance(markerElement, height, status, userID);
  }
}

// Function to create a new marker element
function createMarkerElement(height, status, userID) {
  const markerElement = document.createElement('div');
  markerElement.className = 'marker';
  markerElement.classList.add(statusClass(status)); // Add class based on status

  // Create a container for the labels (height and user)
  const labelContainer = document.createElement('div');
  labelContainer.className = 'marker-label-container';

  // Create a label for height
  const heightLabel = document.createElement('div');
  heightLabel.className = 'marker-label';
  heightLabel.innerText = `Height: ${height.toFixed(2)}m`;

  // Create a label for user ID
  const userLabel = document.createElement('div');
  userLabel.className = 'user-label';
  userLabel.innerText = `User: ${userID}`;

  // Append the labels to the label container
  labelContainer.appendChild(heightLabel);
  labelContainer.appendChild(userLabel);

  // Create a wrapper div to hold both marker and label
  const wrapperElement = document.createElement('div');
  wrapperElement.appendChild(markerElement);  // Append marker to wrapper
  wrapperElement.appendChild(labelContainer);  // Append label container to wrapper

  return wrapperElement;  // Return the entire wrapper element
}

function addOrUpdateMarker(longitude, latitude, height, status, userID) {
  if (longitude === undefined || latitude === undefined) {
    console.error('Invalid marker data:', { longitude, latitude, height, status, userID });
    return;
  }

  // Check if marker already exists
  if (markersMap.has(userID)) {
    // Remove the old marker from the map before adding the updated one
    const oldMarker = markersMap.get(userID);
    window.map.removeOverlay(oldMarker);
    markersMap.delete(userID);
  }

  // Create a new marker element and overlay
  const markerElement = createMarkerElement(height, status, userID);
  const marker = new ol.Overlay({
    position: ol.proj.fromLonLat([longitude, latitude]),
    positioning: 'bottom-center', // Align bottom of marker to coordinates
    element: markerElement,
    stopEvent: false,
  });

  // Add the new marker to the map
  if (window.map) {
    window.map.addOverlay(marker);
    markersMap.set(userID, marker); // Store new marker in markersMap
  } else {
    console.error('Map is not initialized.');
  }
}

// Function to return the correct class based on the status
function statusClass(status) {
  switch (status) {
    case 0: return 'green';  // Active
    case 1: return 'red';    // Critical
    case 2: return 'blue';   // Normal
    case 3: return 'gray';   // Disconnected
    default: return 'purple'; // Unknown status
  }
}

// Function to remove a marker from the map
function removeMarker(userID) {
  const marker = markersMap.get(userID);
  if (marker) {
    window.map.removeOverlay(marker);
    markersMap.delete(userID); // Remove from markersMap
    console.log(`Removed marker for userID: ${userID}`);
  }
}

// Fetch and add markers when the page loads
window.onload = fetchAndAddMarkers;

// Call fetchAndAddMarkers every 5 seconds instead of every second
setInterval(fetchAndAddMarkers, 1000);
