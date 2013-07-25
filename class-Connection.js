/**
 * Created By: Eli
 * Date: 7/24/13
 */

/*
 * This is a wrapper class for a peerjs connection. It gracefully handles making the connection,
 * reopening the connection when it drops, saving and loading connection state, and reliably transferring
 * data over the connection.
 *
 * peer - The Peer object representing our client
 * dstId - The peer id we want to connect with
 * dataCallback - This function is passed any data that the connection receives
 * connectionCallback - This function is called whenever the connection status changes. It is passed true
 *      if the connection is open and false otherwise
 * conn - Optional. This is a peerjs DataConnection object. If included, the MaqawConnection will use it
 *      instead of creating a new one.
 */
function MaqawConnection(peer, dstId, dataCallback, connectionCallback, conn) {
    var that = this;
    this.peer = peer;
    this.dstId = dstId;
    this.connectionCallback = connectionCallback;
    this.dataCallback = dataCallback;

    // whether or not this connection is open. True if open and false otherwise
    this.isConnected = false;

    // the peerjs DataConnection object we are using
    this.conn;

    // if a DataConnection was provided then use it. Otherwise make a new one
    if (conn) {
        this.conn = conn;
    } else {
        this.conn = this.peer.connect(this.dstId);
    }

    // check the current status of the connection. It may already be open if one was passed in
    setConnectionStatus(this.conn.open);

    // set up connection events for the connection
    this.conn.on('open', function () {
        setConnectionStatus(true);
    });

    this.conn.on('data', function (data) {
        // if we are receiving data the connection is definitely open
        setConnectionStatus(true);
        handleData(data);
    });
    this.conn.on('close', function (err) {
        setConnectionStatus(false);
    });

    this.conn.on('error', function (err) {
        console.log("Connection error: " + err);
    });

    /*
     * Handle data that was received by this connection. Extract any meta data we need
     * and pass the rest of it on to the data callback
     */
    function handleData(data){
        // for now we are just sending text
        that.dataCallback(data);
    }

    /*
     * Update the status of the connection, and pass the status on to
     * the connectionListener
     */
    function setConnectionStatus(connectionStatus) {
        that.isConnected = connectionStatus;
        that.connectionCallback(connectionStatus);
    }

    function attemptConnection() {
        // how many milliseconds we will wait until trying to connect again
        var retryInterval = 8000;
        var isConnected = false;

        //  The max number of times a connection will be attempted
        var retryLimit = 5;
        var numAttempts = 0;

        // this function is called when a successful connection is opened
        function successCallback() {
            isConnected = true;
        }

        // create a function that will attempt to open a connection, and will retry
        // every retryInterval milliseconds until a connection is established
        // this function is immediately invoked
        (function tryOpeningConnection() {
            // start the connection opening process
            if (!isConnected && numAttempts < retryLimit) {
                numAttempts++;
                that.openConnection(successCallback);

                // schedule it to try again in a bit.
                setTimeout(tryOpeningConnection, retryInterval);
            }
        })();


    }

    /* Get the connection status.
     * Returns true if the connection is open and false otherwise
     */
    this.isConnected = function () {
        return that.isConnected;
    };

    /*
     * Send text through this connection
     */
    this.sendText = function (text) {
        that.conn.send({
            'text': text
        });
    };

    /*
     * Initializes a screen sharing session
     */
    this.startScreenShare = function (options) {

    };

    /*
     * Sends screen data
     */
    this.sendScreen = function (screenData) {

    }
}
