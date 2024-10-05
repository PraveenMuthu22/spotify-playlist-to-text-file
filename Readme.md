

1. Create a `credentials.ts` file in the root directory with your Spotify application credentials:
   ```typescript
   export const clientId = 'your_client_id_here';
   export const clientSecret = 'your_client_secret_here';
   export const redirectUri = 'http://localhost:8888/callback';
   ```

## Usage

1. Run the application:
   ```
   npm start
   ```
2. The application will open a browser window for you to log in to Spotify and authorize the application.

3. After authorization, you'll be redirected to a URL. Copy the code parameter from this URL.

4. Paste the code when prompted in the terminal.

5. Enter the Spotify playlist ID when prompted. You can find this in the Spotify URL of the playlist.

6. Specify the output file name (e.g., `playlist.txt`).

7. The application will fetch the playlist data and save it to the specified file.