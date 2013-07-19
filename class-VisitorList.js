/*
 VisitorList manages all current visitors and displays the list in a table
 listDisplayContainer - The div that will contain the table of visitors
 chatManager - the ChatManager object that will manage chat sessions
 */
function VisitorList(listDisplayContainer, chatManager, maqawManager) {
    var that = this;
    // hashmap of all visitors on the site. Their id is the key, and their visitor object the value
    this.visitors = {};
    this.listDisplayContainer = listDisplayContainer;
    this.chatManager = chatManager;
    this.maqawManager = maqawManager;
    // a visitor wrapper object representing the visitor that is selected in the table
    this.selectedVisitor;
    this.visitorCounter = 0;

    // create table of visitors
    this.table = document.createElement('table');
    this.table.id = 'visitor-list-table';
    this.tBody = document.createElement('tbody');
    this.table.appendChild(this.tBody);
    this.listDisplayContainer.appendChild(this.table);

    // takes an array of ids of visitors that are on the site
    // checks which of the ids are new, which already exist, and which previous ids aren't active any more
    // the visitor display is updated accordingly
    // visitorIds - an array of ids of visitors on the site
    this.setVisitorList = function (visitorIds) {
        if (visitorIds) {
            // go through each id in the list
            for (var i = 0; i < visitorIds.length; i++) {
                var id = visitorIds[i];
                // check for a visitor with this id
                var visitor = that.visitors[id];
                // if one doesn't exist, create one
                if (typeof visitor === 'undefined') {
                    that.visitors[id] = createNewVisitorWithWrapper(id);
                }
                // otherwise make sure the visitor has an open connection
                else if(!visitor.getIsConnected()){
                    visitor.openConnection();
                }

            }
        }

        // check for current connections that are no longer active
        // Ff the connection is marked as active but we didnt' get an id
        // for it from the server it means the peer disconnected
        // this could be just a page change or refresh, but the connection
        // will be re-established when they make connect with the server again
        // TODO: More efficient way of finding disconnected peers
        for(var visitorId in that.visitors){
            var isConnected = false;
            for(i = 0; i < visitorIds.length; i++){
                if(visitorId === visitorIds[i]){
                    isConnected = true;
                    break;
                }
            }

            // if there are no matching ids for this visitor we need to disconnect them
            if(!isConnected){
                that.visitors[visitorId].disconnect();
            }
        }
    }

    // create a new visitor using the specified id, and wrap the visitor in a VisitorWrapper object
    // to help manage selecting and displaying the visitor
    function createNewVisitorWithWrapper(id) {
        var visitorName = 'Visitor '+that.visitorCounter;
        that.visitorCounter++;
        return new VisitorWrapper(id, visitorName, that);
    }

    this.setSelectedVisitor = function (visitorWrapper) {
        // deselect previously selected row, if there is one
        if (that.selectedVisitor) {
            that.selectedVisitor.deselect();

            // if the previously selected visitor was selected again, leave it deselected
            if(that.selectedVisitor === visitorWrapper){
                that.selectedVisitor = undefined;
                return;
            }
        }

        // set new visitor to be selected
        visitorWrapper.select();

        // save visitor
        that.selectedVisitor = visitorWrapper;
    }
}


// this wrapper class monitors the status of a visitor
function VisitorWrapper(id, name, visitorList) {
    var that = this;
    this.visitorList = visitorList;
    this.visitor = new Visitor(this.visitorList.maqawManager, name, id, visitorConnectionCallback);

    // create row to display this visitor in the table
    this.row = document.createElement("tr");
    this.row.className = 'visitor-list-entry';
    // the row contains a single cell containing the visitor name
    var cell = document.createElement("td");
    var cellText = document.createTextNode(this.visitor.name);
    cell.appendChild(cellText);
    this.row.appendChild(cell);

    // append row to the visitor table
    this.visitorList.tBody.appendChild(this.row);

    this.isSelected = false;
    // we don't care about the row index right now
    this.rowIndex;

    // append click listener to row
    this.row.addEventListener('click', clickCallBack, false);
    function clickCallBack() {
        that.visitorList.setSelectedVisitor(that);
    }

    this.select = function () {
        that.isSelected = true;
        // change class to selected
        that.row.className = 'selected-visitor';
        // show visitor chat window
        that.visitorList.chatManager.showVisitorChat(that.visitor)
    }

    this.deselect = function () {
        that.isSelected = false;
        // change class to default
        that.row.className = 'visitor-list-entry';
        // clear chat window
        that.visitorList.chatManager.clear();
    }

    this.getVisitor = function () {
        return that.visitor;
    }

    this.getId = function () {
        return that.visitor.getId();
    }

    this.getIsConnected = function () {
        return that.visitor.getChatSession().getIsConnected();
    }

    // tells the visitors chat session to open it's connection. The chat session will
    // only do this if it's connection has been closed. if it succeeds in reopening the
    // connection it will call the visitorConnectionCallback function
    this.openConnection = function() {
        that.visitor.getChatSession().openConnection();
    }

    // close the chat session connection
    this.disconnect = function(){
        that.visitor.getChatSession().disconnect();
    }

    // the visitor's chat session calls this function whenever the chat connection
    // status changes. A bool representing the new status is passed in, with true for
    // connected and false for disconnected
    function visitorConnectionCallback(isConnected){
         console.log('VisitorWrapper connection status: '+isConnected);
    }
}
