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
                // otherwise make sure the visitor is marked as active
                else {
                    visitor.setIsActive(true);
                }

            }
        }
    }

    // create a new visitor using the specified id, and wrap the visitor in a VisitorWrapper object
    // to help manage selecting and displaying the visitor
    function createNewVisitorWithWrapper(id) {
        var visitor =
        that.visitorCounter++;
        var visitorWrapper = new VisitorWrapper(id, visitorName, that);
        return visitorWrapper;
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
    this.visitor = new Visitor(this.visitorList.maqawManager, name, id);

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

    this.getIsActive = function () {
        return that.visitor.getChatSession().isConnected();
    }
}
