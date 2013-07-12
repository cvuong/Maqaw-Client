
function showLoggedIn() {
    chatHeaderText.innerHTML = "Chat with visitors";
    clientChatWindow.style.display = 'none';
    loggedInWindow.style.display = 'block';
    loginWindow.style.display = 'none';
}

// logs the user out and returns to the generic chat screen
function logout() {
    showClientChat();
}


