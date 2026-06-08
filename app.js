const input = document.getElementById('urlInput');
const btn = document.getElementById('fetchBtn');
const result = document.getElementById('result');
const thumbImg = document.getElementById('thumbImg');
const downloadBtn = document.getElementById('downloadBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

const googleSignInContainer = document.getElementById('googleSignInContainer');
const userInfoContainer = document.getElementById('userInfoContainer');
const userProfilePic = document.getElementById('userProfilePic');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const signOutBtn = document.getElementById('signOutBtn');

const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
const successSound = new Audio('https://www.soundjay.com/misc/sounds/pop-up-on-sound-effect.mp3');

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

window.handleCredentialResponse = (response) => {
    const userObject = parseJwt(response.credential);
    localStorage.setItem('user', JSON.stringify(userObject));
    updateUI(userObject);
    successSound.play();
};

function updateUI(user) {
    if (user) {
        userInfoContainer.classList.remove('hidden');
        googleSignInContainer.classList.add('hidden');
        userProfilePic.src = user.picture;
        userName.textContent = user.name;
        userEmail.textContent = user.email;
    } else {
        userInfoContainer.classList.add('hidden');
        googleSignInContainer.classList.remove('hidden');
    }
}

signOutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    location.reload();
});

btn.addEventListener('click', () => {
    clickSound.play();
    const url = input.value;
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\?]{11})/);
    
    if (videoIdMatch) {
        const thumbUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
        thumbImg.src = thumbUrl;
        result.classList.remove('hidden');
        downloadBtn.href = thumbUrl;
    } else {
        alert('Invalid YouTube URL');
    }
});

window.onload = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) updateUI(JSON.parse(savedUser));
    else googleSignInContainer.classList.remove('hidden');
};