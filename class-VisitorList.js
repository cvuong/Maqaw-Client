/*
 VisitorList manages all current visitors and displays the list in a table
 listDisplayContainer - The div that will contain the table of visitors
 chatManager - the ChatManager object that will manage chat sessions
 */
function MaqawVisitorList(listDisplayContainer, repSession) {
    var that = this;
    // hashmap of all visitors on the site. Their id is the key, and their visitor object the value
    this.visitors = {};
    this.listDisplayContainer = listDisplayContainer;
    this.chatManager = repSession.chatManager;
    this.maqawManager = repSession.maqawManager;
    this.repSession = repSession;
    // a visitor wrapper object representing the visitor that is selected in the table
    this.selectedVisitor;
    this.visitorCounter = 1;

    // create table of visitors
    this.table = document.createElement('table');
    this.table.id = 'maqaw-visitor-list-table';
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
                else if (!visitor.getIsConnected()) {
                    visitor.setServerConnectionStatus(true);
                }

            }
        }

        // check for current connections that are no longer active
        // Ff the connection is marked as active but we didnt' get an id
        // for it from the server it means the peer disconnected
        // this could be just a page change or refresh, but the connection
        // will be re-established when they make connect with the server again
        // TODO: More efficient way of finding disconnected peers
        for (var visitorId in that.visitors) {
            var isConnected = false;
            for (i = 0; i < visitorIds.length; i++) {
                if (visitorId === visitorIds[i]) {
                    isConnected = true;
                    break;
                }
            }

            // if there are no matching ids for this visitor we need to disconnect them
            if (!isConnected) {
                that.visitors[visitorId].setServerConnectionStatus(false);
            }
        }
    };

    // create a new visitor using the specified id, and wrap the visitor in a MaqawVisitorWrapper object
    // to help manage selecting and displaying the visitor
    function createNewVisitorWithWrapper(id) {
        var visitorName = 'Visitor ' + that.visitorCounter;
        that.visitorCounter++;
        // use rowIndex of -1 so the row is added at the end of the table
        return new MaqawVisitorWrapper(id, visitorName, that, -1);
    }

    this.setSelectedVisitor = function (visitorWrapper) {
        // deselect previously selected row, if there is one
        if (that.selectedVisitor) {
            that.selectedVisitor.deselect();

            // if the previously selected visitor was selected again, leave it deselected
            if (that.selectedVisitor === visitorWrapper) {
                that.selectedVisitor = undefined;
                return;
            }
        }

        // set new visitor to be selected
        visitorWrapper.select();

        // save visitor
        that.selectedVisitor = visitorWrapper;
    };


    // a visitorwrapper calls this to tell the MaqawVisitorList that it is going inactive
    // the visitor list needs to make sure that it doesn't have this visitor set
    // as selected
    this.hideVisitor = function (visitorWrapper) {
        if (that.selectedVisitor && that.selectedVisitor === visitorWrapper) {
            that.selectedVisitor = undefined;
        }
    };

    // return the an object representing the state of this visitorList
    this.getListData = function () {
        var data = {};
        // create an entry for each visitor
        var counter = 0;
        for (var visitorId in that.visitors) {
            var visitorWrapper = that.visitors[visitorId];
            // save the data that is important to state
            var visitorData = {
                name: visitorWrapper.visitor.name,
                id: visitorWrapper.getId(),
                isSelected: visitorWrapper.isSelected,
                rowIndex: visitorWrapper.row.rowIndex,
                chatText: visitorWrapper.visitor.getChatSession().getText()
            };
            data[counter] = visitorData;
            counter++;
        }
        return data;
    };

    // load a state represented by an object from getListData
    this.loadListData = function (listData) {
          // start by clearing any existing visitors and the visitor table
        that.visitors = {};
        that.tBody.innerHTML = '';

        // set the visitor counter to be the number of visitors stored
        that.visitorCounter = listData.length;

        // go through each entry in the list data and restore it
        for(var index in listData){
            var dataObject = listData[index];
            // create and update a visitorWrapper using this data
            // ideally we would like the visitors to show up in the same order in the table, but right now
            // we just append it to the end by passing rowIndex of -1

            var visitorWrapper = new MaqawVisitorWrapper(dataObject['id'], dataObject['name'], that);

            if(dataObject['isSelected']) {
                that.selectedVisitor = visitorWrapper;
                visitorWrapper.select();
            }

            // load the chat history
            visitorWrapper.visitor.getChatSession().setText(dataObject['chatText']);

            // save this visitor in the list
            that.visitors[visitorWrapper.getId()] = visitorWrapper;
        }
    }
}
