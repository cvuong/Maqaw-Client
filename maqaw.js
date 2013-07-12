/*
 This file generates a Maqaw client that can be loaded onto a site
 */

// start by creating the display
var maqawDisplay = new MaqawDisplay(false);
maqawDisplay.setup();

// Initialize the MaqawManager to deal with clients and representatives
var maqawManager = new MaqawManager(maqawDisplay);

// Init a new client session
var session = new ClientSession(maqawManager);
maqawManager.setActiveSession(session);

maqawManager.updateDisplay();
