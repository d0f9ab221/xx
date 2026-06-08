const input = document.getElementById('urlInput');
const btn = document.getElementById('fetchBtn');
const result = document.getElementById('result');
const thumbImg = document.getElementById('thumbImg');
const downloadBtn = document.getElementById('downloadBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

// Google Sign-In Elements
const googleSignInContainer = document.getElementById('googleSignInContainer');
const userInfoContainer = document.getElementById('userInfoContainer');
const userProfilePic = document.getElementById('userProfilePic');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const signOutBtn = document.getElementById('signOutBtn');

// Initialize Audio objects using the Web Audio API concept (new Audio)
const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3'); // For button clicks
const successSound = new Audio('https://www.soundjay.com/misc/sounds/pop-up-on-sound-effect.mp3'); // For successful thumbnail fetch
const errorSound = new Audio('https://www.soundjay.com/buttons/sounds/button-2.mp3'); // For invalid input

// --- Google Sign-In Logic ---
// IMPORTANT: Replace 'YOUR_GOOGLE_CLIENT_ID' in index.html with your actual Google Client ID
// You can get one from Google Cloud Console: https://console.cloud.google.com/apis/credentials

function handleCredentialResponse(response) {
    // This function is called after successful login
    // The `response.credential` contains the JWT token
    console.log("Encoded JWT ID token: " + response.credential);
    const id_token = response.credential;

    // Decode the JWT to get user info (client-side only for display)
    const userObject = parseJwt(id_token);
    console.log(userObject);

    if (userObject) {
        userInfoContainer.classList.remove('hidden');
        googleSignInContainer.classList.add('hidden');
        userProfilePic.src = userObject.picture;
        userName.textContent = userObject.name;
        userEmail.textContent = userObject.email;
        successSound.play(); // Play success sound for login
    } else {
        console.error('Failed to parse user object from JWT.');
        errorSound.play(); // Play error sound if login fails
    }

    // *** Backend Integration Note ***
    // For a production app, you would send this 'id_token' to your backend server
    // The backend would then verify the token with Google and create a secure session.
    // Example: fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: id_token }) });
}

function parseJwt (token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

signOutBtn.addEventListener('click', () => {
    // Google Sign-Out
    google.accounts.id.disableAutoSelect(); // Important for proper sign out
    userInfoContainer.classList.add('hidden');
    googleSignInContainer.classList.remove('hidden');
    alert('You have been signed out.');
    clickSound.play(); // Play click sound for sign out
});

// Initialize Google Sign-In button visibility on page load
// This should ideally check if a user is already signed in (via a backend session)
// For this client-side demo, we just show the sign-in button initially
if (!userInfoContainer.classList.contains('hidden')) {
    googleSignInContainer.classList.add('hidden');
} else {
    googleSignInContainer.classList.remove('hidden');
}

// --- Existing Thumbnail Downloader Logic ---
btn.addEventListener('click', () => {
    clickSound.play(); // Play click sound on button press
    fetchThumbnail();
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        clickSound.play(); // Play click sound on Enter key
        fetchThumbnail();
    }
});

copyLinkBtn.addEventListener('click', async () => {
    if (thumbImg.src && thumbImg.src !== window.location.href) { // Avoid copying empty/default src
        try {
            await navigator.clipboard.writeText(thumbImg.src);
            alert('Thumbnail link copied to clipboard!');
            successSound.play(); // Play success sound for copying
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy the link.');
            errorSound.play(); // Play error sound if copy fails
        }
    }
});

function fetchThumbnail() {
    const url = input.value.trim();
    const videoId = extractVideoID(url);
    
    if (videoId) {
        const imgUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        thumbImg.src = imgUrl;
        downloadBtn.href = imgUrl;
        result.classList.remove('hidden');
        successSound.play(); // Play success sound when thumbnail is displayed
    } else {
        alert('Please valid YouTube link enter karein!');
        errorSound.play(); // Play error sound for invalid input
        result.classList.add('hidden'); // Hide results if input is invalid
    }
}

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Initial check for a user (for a real app, this would be a server-side check)
// For this client-side demo, we initially assume no user is logged in
window.onload = () => {
    googleSignInContainer.classList.remove('hidden');
    userInfoContainer.classList.add('hidden');
};
