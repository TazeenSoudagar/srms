// Postman Test Script for verify-otp API
// This script runs automatically after the API request completes
// It extracts the token from the response and saves it to a Postman variable

// Check if the response status is successful (200)
if (pm.response.code === 200) {
    // Parse the JSON response
    const responseJson = pm.response.json();

    // Check if token exists in the response
    if (responseJson.token) {
        // Save token to environment variable (recommended)
        pm.environment.set("auth_token", responseJson.token);

        // Alternatively, save to collection variable (uncomment if needed)
        // pm.collectionVariables.set("auth_token", responseJson.token);

        // Log success message
        console.log("Token saved successfully:", responseJson.token);
    } else {
        console.error("Token not found in response");
    }
} else {
    console.error("Request failed with status:", pm.response.code);
    console.error("Response:", pm.response.text());
}

