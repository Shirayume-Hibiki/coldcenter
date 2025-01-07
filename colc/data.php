<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers to allow requests from the same origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set the content type to JSON for the response
header('Content-Type: application/json');

// File path for storing data
$dataFile = 'data.json';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        $existingData = file_get_contents($dataFile);
        
        // Check if the file content is valid JSON
        json_decode($existingData);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(500); // Internal Server Error
            echo json_encode(['error' => 'Invalid JSON in data file']);
            exit;
        }
        // Include server time in the response
        $response = [
            'data' => json_decode($existingData),
            'serverTime' => time()
        ];

        echo json_encode($response);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'Data file not found']);
    }
    exit; // End the script after handling GET requests
}

// Handle PUT request
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Extract and validate values
    $userID = isset($data['userID']) ? $data['userID'] : null;
    $longitude = isset($data['longitude']) ? $data['longitude'] : null;
    $latitude = isset($data['latitude']) ? $data['latitude'] : null;
    $height = isset($data['height']) ? $data['height'] : null;
    $status = isset($data['status']) ? $data['status'] : null;

    if ($userID === null || $longitude === null || $latitude === null || $height === null || $status === null) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

// Read existing data
$existingData = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

    // Update the user's marker data in the existing data array
    $updated = false;
    foreach ($existingData as &$entry) {
        if ($entry['userID'] === $userID) {
            $entry['longitude'] = $longitude;
            $entry['latitude'] = $latitude;
            $entry['height'] = $height;
            $entry['status'] = $status;
            $entry['lastUpdate'] = time(); // Correctly updating the timestamp
            $updated = true;
            break;
        }
    }

    // If not updated, add a new entry
    if (!$updated) {
        $existingData[] = [
            'userID' => $userID,
            'longitude' => $longitude,
            'latitude' => $latitude,
            'height' => $height,
            'status' => $status,
            'lastUpdate' => time()
        ];
    }

    // Save updated data
    if (file_put_contents($dataFile, json_encode($existingData, JSON_PRETTY_PRINT)) === false) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Failed to write data to file']);
        exit;
    }

    http_response_code(200); // OK
    echo json_encode(['message' => 'Data processed successfully']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($data['userID'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid JSON or missing userID']);
        exit;
    }

    $userIDToRemove = $data['userID'];

    // Read existing data
    $existingData = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Invalid JSON in data file']);
        exit;
    }

    // Filter out entries with the specified userID
    $existingData = array_filter($existingData, function ($entry) use ($userIDToRemove) {
        return $entry['userID'] !== $userIDToRemove;
    });

    // Save updated data back to the file
    if (file_put_contents($dataFile, json_encode(array_values($existingData), JSON_PRETTY_PRINT)) === false) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Failed to write data to file']);
        exit;
    }

    http_response_code(200); // OK
    echo json_encode(['message' => 'User data deleted successfully']);
    exit;
}