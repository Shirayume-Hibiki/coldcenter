<?php
// Set the content type to JSON for the response
header('Content-Type: application/json');

// Handle PUT request
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Read the raw input data from the PUT request
    $input = file_get_contents('php://input');

    // Decode the JSON data into a PHP associative array
    $data = json_decode($input, true);

    // Check if JSON decoding was successful
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Extract values from the decoded data
    $longitude = isset($data['longitude']) ? $data['longitude'] : null;
    $latitude = isset($data['latitude']) ? $data['latitude'] : null;
    $height = isset($data['height']) ? $data['height'] : null;
    $status = isset($data['status']) ? $data['status'] : null;

    // Validate data
    if ($longitude === null || $latitude === null || $height === null || $status === null) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    // Process the data (e.g., update a database, log it, etc.)
    try {
        $logEntry = "Longitude: $longitude, Latitude: $latitude, Height: $height, Status: $status\n";
        file_put_contents('log.txt', $logEntry, FILE_APPEND);

        // Send a success response with the longitude and latitude for further use
        http_response_code(200); // OK
        echo json_encode(['message' => 'Data processed successfully', 'longitude' => $longitude, 'latitude' => $latitude]);
    } catch (Exception $e) {
        // Handle any errors
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Invalid request method']);
}
?>