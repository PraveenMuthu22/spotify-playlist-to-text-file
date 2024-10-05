# Spotify Playlist Downloader

## Usage

1. Run the application:
   ```
   npm start
   ```

2. The application will open a browser window for you to log in to Spotify and authorize the application.

3. After authorization, you'll be redirected to a URL. Copy the code parameter from this URL.

4. Paste the code when prompted in the terminal.

5. Enter the Spotify playlist ID when prompted. You can find this in the Spotify URL of the playlist.

6. Specify the output file name (e.g., `summer_hits`). You don't need to add the `.txt` extension; the application will add it automatically.

7. The application will fetch the playlist data and save it to a file in the `./playlists/` directory.

8. After processing one playlist, you'll be prompted to enter another playlist ID. You can continue downloading multiple playlists in one session.

9. To exit the application, type 'exit' when prompted for a playlist ID.

Note: All playlist files are saved in the `./playlists/` directory within your project folder. Each file is automatically given a `.txt` extension if not provided in the filename.
