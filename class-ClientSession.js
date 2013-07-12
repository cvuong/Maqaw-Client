/*
 ClientSession manages client information and interactions
 with Maqaw.
 */
function ClientSession(manager) {
    var that = this;
    this.chatSession = new ChatSession('src', 'dst');
    this.maqawManager = manager;

    // initialize header container for this session
    this.header = document.createElement('DIV');
    this.header.className = 'maqaw-default-client-header';

    // initialize body container
    this.body = document.createElement('DIV');

    /* Create elements that make up chat window */
    this.chatHeader = document.createElement('DIV');
    this.chatHeader.innerHTML = "Chat with me!";
    this.chatHeader.className = 'maqaw-chat-header-text';

    // create div to hold chat info
    this.clientChatWindow = document.createElement('DIV');
    this.clientChatWindow.id = 'client-chat-window';

    // add chat session
    this.clientChatWindow.appendChild(this.chatSession.getContainer());

    // add footer
    var chatFooter;
    chatFooter = document.createElement('DIV');
    chatFooter.id = 'chat-footer';
    this.clientChatWindow.appendChild(chatFooter);

    // add login button to footer
    var loginButton;
    loginButton = document.createElement('DIV');
    loginButton.id = 'login-button';
    loginButton.innerHTML = "Login"
    chatFooter.appendChild(loginButton);

    // setup callback for when login is clicked
    loginButton.addEventListener('click', setLoginPage, false);

    // add Maqaw link to footer
    var maqawLink;
    maqawLink = document.createElement('DIV');
    maqawLink.id = 'maqaw-link';
    maqawLink.innerHTML = 'POWERED BY <a href="http://www.maqaw.com">MAQAW</a>';
    chatFooter.appendChild(maqawLink);


    // set the chat window to default to this configuration
    setClientChat();

    /* Create elements that make up the login window  for when the login button is clicked */
    // create login header
    this.loginHeader = document.createElement('DIV');
    this.loginHeader.innerHTML = "Login";
    this.loginHeader.className = 'maqaw-chat-header-text';

    // create login window
    this.loginWindow = document.createElement('DIV');
    this.loginWindow.id = 'login-window';

    // add title to login window
    var loginTitle;
    loginTitle = document.createElement('DIV');
    loginTitle.id = 'login-title';
    loginTitle.innerHTML = 'Login to your account';
    this.loginWindow.appendChild(loginTitle);

    // create login form
    var usernameField = document.createElement("input");
    usernameField.setAttribute('type', "text");
    usernameField.setAttribute('name', "username");
    usernameField.setAttribute('size', "31");
    usernameField.setAttribute('placeholder', 'username');
    this.loginWindow.appendChild(usernameField);

    var passwordField = document.createElement("input");
    passwordField.setAttribute('type', "text");
    passwordField.setAttribute('name', "password");
    passwordField.setAttribute('size', "31");
    passwordField.setAttribute('placeholder', 'password');
    this.loginWindow.appendChild(passwordField);

    // submit button
    var loginSubmitButton = document.createElement('DIV');
    loginSubmitButton.id = 'login-submit-button';
    loginSubmitButton.className = 'login-page-button';
    loginSubmitButton.innerHTML = 'Login';
    this.loginWindow.appendChild(loginSubmitButton);

    // set up login button listener
    loginSubmitButton.addEventListener('click', this.maqawManager.loginClicked, false);

    // back button
    var loginBackButton = document.createElement('DIV');
    loginBackButton.id = 'login-back-button';
    loginBackButton.className = 'login-page-button';
    loginBackButton.innerHTML = 'Back';
    this.loginWindow.appendChild(loginBackButton);

    // set up back button listener
    loginBackButton.addEventListener('click', setClientChat, false);

    // add login footer text
    var loginFooter = document.createElement('DIV');
    loginFooter.id = 'login-footer';
    loginFooter.innerHTML = "Don't have an account? Sign up at <a href='http://www.maqaw.com'>Maqaw.com</a>!";
    this.loginWindow.appendChild(loginFooter);

    // Switches the chat window to display login fields
    function setLoginPage() {
        that.body.innerHTML = '';
        that.body.appendChild(that.loginWindow);
        that.header.innerHTML = '';
        that.header.appendChild(that.loginHeader);
    }

    function setClientChat() {
        that.body.innerHTML = '';
        that.body.appendChild(that.clientChatWindow);
        that.header.innerHTML = '';
        that.header.appendChild(that.chatHeader);
    }


}

ClientSession.prototype.getBodyContents = function () {
    return this.body;
}

ClientSession.prototype.getHeaderContents = function () {
    return this.header;
}

