import SpotifyWebApi from 'spotify-web-api-node';
import * as fs from 'fs';
import * as path from 'path';
import readlineSync from 'readline-sync';
import open from 'open';
import { clientId, clientSecret } from './credentials';

const redirectUri = 'http://localhost:8888/callback';

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

const scopes = ['playlist-read-private', 'playlist-read-collaborative'];

interface Track {
  name: string;
  artists: { name: string }[];
}

async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  let tracks: Track[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await spotifyApi.getPlaylistTracks(playlistId, { offset: offset, limit: limit });
    const items = data.body.items;
    
    if (items.length === 0) break;
    
    tracks = tracks.concat(items.map(item => item.track));
    offset += limit;

    if (data.body.next === null) break;
  }

  return tracks;
}

function saveTracksToFile(tracks: Track[], filename: string): void {
  const content = tracks.map((track, index) => {
    const artists = track.artists.map(artist => artist.name).join(', ');
    return `${index + 1}. ${track.name} - ${artists}`;
  }).join('\n');

  const playlistsDir = path.join(process.cwd(), 'playlists');
  if (!fs.existsSync(playlistsDir)) {
    fs.mkdirSync(playlistsDir);
  }

  // Ensure the filename has a .txt extension
  const fileNameWithExtension = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  const filePath = path.join(playlistsDir, fileNameWithExtension);
  fs.writeFileSync(filePath, content, 'utf-8');
}

async function processPlaylist() {
  const playlistId = readlineSync.question("Please enter your Spotify playlist ID (or type 'exit' to quit): ");
  
  if (playlistId.toLowerCase() === 'exit') {
    return false;
  }

  let outputFile = readlineSync.question("Please enter the output file name (e.g., pop_art): ");

  console.log("\nProcessing your request...");
  try {
    const tracks = await getPlaylistTracks(playlistId);
    saveTracksToFile(tracks, outputFile);
    console.log(`Playlist saved to ./playlists/${outputFile}.txt`);
  } catch (error) {
    console.error('An error occurred while processing the playlist:', error);
  }

  return true;
}
async function authenticateUser(): Promise<void> {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
  
  console.log('Please visit this URL to authorize the application:');
  console.log(authorizeURL);
  
  await open(authorizeURL);

  const code = readlineSync.question('Enter the code from the redirect URL: ');

  const data = await spotifyApi.authorizationCodeGrant(code);
  spotifyApi.setAccessToken(data.body['access_token']);
  spotifyApi.setRefreshToken(data.body['refresh_token']);
}

async function main() {
  try {
    await authenticateUser();

    console.log("\n--- Spotify Playlist Downloader ---");
    
    let continueProcessing = true;
    while (continueProcessing) {
      continueProcessing = await processPlaylist();
      
      if (continueProcessing) {
        console.log("\n--- Ready for next playlist ---");
      }
    }

    console.log("Thank you for using the Spotify Playlist Downloader. Goodbye!");
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();