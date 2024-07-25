const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
const redirectUri = 'http://localhost:8000/callback.html'; // Adjust according to your local server

document.getElementById('login-button').addEventListener('click', () => {
    const scope = 'user-library-read playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
});

function fetchUserData(token) {
    fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('login-button').classList.add('hidden');
        document.getElementById('music-container').classList.remove('hidden');
        document.getElementById('playlist-container').classList.remove('hidden');
        fetchMusicLibrary(token);
        fetchUserPlaylists(token);
    });
}

function fetchMusicLibrary(token) {
    fetch('https://api.spotify.com/v1/me/tracks', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const musicList = document.getElementById('music-list');
        data.items.forEach(item => {
            const musicItem = document.createElement('div');
            musicItem.classList.add('music-item');
            musicItem.innerHTML = `
                <strong>${item.track.name}</strong><br>
                ${item.track.artists.map(artist => artist.name).join(', ')}
            `;
            musicList.appendChild(musicItem);
        });
    });
}

function fetchUserPlaylists(token) {
    fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const playlists = document.getElementById('playlists');
        data.items.forEach(item => {
            const playlistItem = document.createElement('div');
            playlistItem.classList.add('playlist-item');
            playlistItem.innerHTML = `<strong>${item.name}</strong>`;
            playlists.appendChild(playlistItem);
        });
    });
}

document.getElementById('playlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const playlistName = document.getElementById('playlist-name').value;
    createPlaylist(token, playlistName);
});

function createPlaylist(token, name) {
    fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const userId = data.id;
        fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        })
        .then(response => response.json())
        .then(data => {
            const playlists = document.getElementById('playlists');
            const playlistItem = document.createElement('div');
            playlistItem.classList.add('playlist-item');
            playlistItem.innerHTML = `<strong>${data.name}</strong>`;
            playlists.appendChild(playlistItem);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1).split('&').reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = value;
        return acc;
    }, {});

    if (hash.access_token) {
        fetchUserData(hash.access_token);
    }
});
