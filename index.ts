import SpotifyWebApi from 'spotify-web-api-node';
import * as fs from 'fs';
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

  fs.writeFileSync(filename, content, 'utf-8');
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

    console.log("\n--- Playlist Information ---");
    const playlistId = readlineSync.question("Please enter your Spotify playlist ID: ");
    const outputFile = readlineSync.question("Please enter the output file name (e.g., playlist.txt): ");

    console.log("\nProcessing your request...");
    const tracks = await getPlaylistTracks(playlistId);
    saveTracksToFile(tracks, outputFile);
    console.log(`Playlist saved to ${outputFile}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();