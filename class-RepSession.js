/*
 RepSession manages all of the details of a logged in
 representatives session
 */
function RepSession(manager) {
    this.maqawManager = manager;

    /* Create dom elements to display the rep session */
    this.body = document.createElement("DIV");
    this.header = document.createElement("DIV");
    this.header.className = 'maqaw-default-client-header';

    // add text to header
    var header = document.createElement("DIV");
    header.innerHTML = 'Welcome!';
    header.className = 'maqaw-chat-header-text';
    this.header.appendChild(header);

    // create window for logged in users
    var loggedInWindow = document.createElement('DIV');
    this.body.appendChild(loggedInWindow);

    var loggedInChatWindow = document.createElement('DIV');
    loggedInChatWindow.id = 'logged-in-chat-window';
    loggedInWindow.appendChild(loggedInChatWindow);

// create div to hold chat sessions
    var chatSessions = document.createElement('DIV');
    loggedInChatWindow.appendChild(chatSessions);

// add footer for logged in chat window
    var loggedInChatFooter = document.createElement('DIV');
    loggedInChatFooter.id = 'logged-in-chat-footer';
    loggedInChatWindow.appendChild(loggedInChatFooter);

// add logout button
    var logoutButton = document.createElement('DIV');
    logoutButton.id = 'logout-button';
    logoutButton.innerHTML = 'Logout';
    loggedInChatFooter.appendChild(logoutButton);
// add logout listener
    logoutButton.addEventListener('click', this.maqawManager.logoutClicked, false);

// create dashboard for logged in users
    var loggedInDashboard = document.createElement('DIV');
    loggedInDashboard.id = 'logged-in-dashboard';
    loggedInWindow.appendChild(loggedInDashboard);

// create title for dashboard
    var dashboardTitle = document.createElement('DIV');
    dashboardTitle.id = 'dashboard-title';
    dashboardTitle.innerHTML = 'Visitors';
    loggedInDashboard.appendChild(dashboardTitle);

// div to hold table of visitors
    var visitorListContainer = document.createElement('DIV');
    visitorListContainer.id = 'visitor-list-container';
    loggedInDashboard.appendChild(visitorListContainer);

    // create new chat manager
    this.chatManager = new ChatManager(chatSessions);

    // create new visitor list
    this.visitorList = new VisitorList(visitorListContainer, this.chatManager);

    this.visitorList.addVisitor(new Visitor('eli', '1'));
    this.visitorList.addVisitor(new Visitor('tom', '2'));

}

RepSession.prototype.getBodyContents = function() {
    return this.body;
}

RepSession.prototype.getHeaderContents = function() {
    return this.header;
}