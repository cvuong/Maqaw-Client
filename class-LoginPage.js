/**
 * Created By: Eli
 * Date: 7/15/13
 */

function LoginPage(manager) {
    this.maqawManager = manager;
    /* Create elements that make up the login page */
// create login header
    this.header = document.createElement('DIV');
    this.header.className = 'maqaw-default-client-header';
     // add text to header
    this.loginHeader = document.createElement('DIV');
    this.loginHeader.innerHTML = "Login to your account";
    this.loginHeader.className = 'maqaw-chat-header-text';
    this.header.appendChild(this.loginHeader);

// create login window
    this.body = document.createElement('DIV');
    this.body.id = 'login-window';

// add title to login window
    var loginTitle;
    loginTitle = document.createElement('DIV');
    loginTitle.id = 'login-title';
    loginTitle.innerHTML = 'Login to your account';
    this.body.appendChild(loginTitle);

// create login form
    var usernameField = document.createElement("input");
    usernameField.setAttribute('type', "text");
    usernameField.setAttribute('name', "username");
    usernameField.setAttribute('size', "31");
    usernameField.setAttribute('placeholder', 'username');
    this.body.appendChild(usernameField);

    var passwordField = document.createElement("input");
    passwordField.setAttribute('type', "text");
    passwordField.setAttribute('name', "password");
    passwordField.setAttribute('size', "31");
    passwordField.setAttribute('placeholder', 'password');
    this.body.appendChild(passwordField);

// submit button
    var loginSubmitButton = document.createElement('DIV');
    loginSubmitButton.id = 'login-submit-button';
    loginSubmitButton.className = 'login-page-button';
    loginSubmitButton.innerHTML = 'Login';
    this.body.appendChild(loginSubmitButton);

// set up submit button listener
    loginSubmitButton.addEventListener('click', this.maqawManager.loginClicked, false);

// back button
    var loginBackButton = document.createElement('DIV');
    loginBackButton.id = 'login-back-button';
    loginBackButton.className = 'login-page-button';
    loginBackButton.innerHTML = 'Back';
    this.body.appendChild(loginBackButton);

// set up back button listener
    loginBackButton.addEventListener('click', this.maqawManager.showVisitorSession, false);

// add login footer text
    var loginFooter = document.createElement('DIV');
    loginFooter.id = 'login-footer';
    loginFooter.innerHTML = "Don't have an account? Sign up at <a href='http://www.maqaw.com'>Maqaw.com</a>!";
    this.body.appendChild(loginFooter);
}

LoginPage.prototype.getBodyContents = function () {
    return this.body;
}

LoginPage.prototype.getHeaderContents = function () {
    return this.header;
}