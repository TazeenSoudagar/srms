# Postman Scripts

This directory contains Postman test scripts for API endpoints.

## verify-otp-test-script.js

Test script for the `POST /api/auth/verify-otp` endpoint.

### Usage

1. Open Postman
2. Create or select your request for `POST /api/auth/verify-otp`
3. Go to the **Tests** tab
4. Copy and paste the contents of `verify-otp-test-script.js`
5. Make sure you have a Postman Environment created (or use Collection Variables)
6. Run the request

### What it does

- Checks if the response status is 200 (success)
- Extracts the `token` from the JSON response
- Saves it to the Postman environment variable `auth_token`
- Logs success/error messages to the console

### Using the saved token

After running the verify-otp request, you can use the saved token in other requests:

1. In the **Authorization** tab, select **Bearer Token**
2. In the token field, enter: `{{auth_token}}`

Or in the **Headers** tab:
- Key: `Authorization`
- Value: `Bearer {{auth_token}}`

### Environment Variables

The script saves the token to an environment variable. Make sure:
- You have an environment selected in Postman
- The environment is active (check the dropdown in the top right)

### Alternative: Collection Variables

If you prefer to use collection variables instead of environment variables, uncomment this line in the script:
```javascript
pm.collectionVariables.set("auth_token", responseJson.token);
```
And comment out the environment variable line.

