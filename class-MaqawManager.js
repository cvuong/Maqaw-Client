/*
 MaqawManager is the top level class for managing the Maqaw client
 */
function MaqawManager(display) {
    var that = this;
    this.activeSession = undefined;
    this.maqawDisplay = display;

    this.updateDisplay = function () {
        that.maqawDisplay.setHeaderContents(that.activeSession.getHeaderContents());
        that.maqawDisplay.setBodyContents(that.activeSession.getBodyContents());
    }

    this.loginClicked = function () {
        that.clientSession = that.activeSession;
        that.activeSession = new RepSession(that);
        that.updateDisplay();
    }

    this.logoutClicked = function () {
        that.repSession = that.activeSession;
        that.activeSession = that.clientSession;
        that.updateDisplay();
    }
}

MaqawManager.prototype.setActiveSession = function (session) {
    this.activeSession = session;
}


