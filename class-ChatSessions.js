/*
 Creates a chat window with a unique key to talk
 to a visitor.
 */
function ChatSession(chatSessionContainer, peer, srcName, dstName, dstId, connectionCallback) {
    this.srcName = srcName;
    this.dstName = dstName;
    this.dstId = dstId;
    var that = this;
    this.peer = peer;
    var isConnected = false;
    var conn;

    // callback function for when the connection status changes. True is passed if a connection
    // becomes open, and false is passed if the connection closes
    this.connectionCallback = connectionCallback;

    // parent div to display chat session
    this.mainContainer = chatSessionContainer;

    // add div to display chat text
    this.textDisplay;
    this.textDisplay = document.createElement('DIV');
    this.textDisplay.className = 'chat-display';
    this.mainContainer.appendChild(this.textDisplay);

    this.textDisplay.addEventListener('load', function(){alert('hi')}, false);

    // put initial text in the display window
    this.textDisplay.innerHTML = "Questions or feedback? We're online and ready to help you!";

    // add box for text entry
    var textInput;
    textInput = document.createElement('textarea');
    textInput.className = 'chat-entry';
    textInput.setAttribute('placeholder', 'Type and hit enter to chat');
    this.mainContainer.appendChild(textInput);


    // add listener to text input. Capture text when enter is pressed
    try {
        textInput.addEventListener("keyup", keyPress, false);
    } catch (e) {
        textInput.attachEvent("onkeyup", keyPress);
    }



    function keyPress(e) {
        // check if enter was pressed
        if (e.keyCode === 13) {
            // get entered text and reset the box
            var text = textInput.value;
            textInput.value = "";
            handleInput(text);
            // scroll to bottom of chat window
            that.scrollToBottom();
        } else {
            return;
        }
    }

    // This function is passed any text that the user inputs
    function handleInput(text) {
        // test if string is not just whitespace
        if (/\S/.test(text)) {
            //send data to other side
            if (conn) conn.send(text);
            // append new text to existing chat text
            that.textDisplay.innerHTML = that.textDisplay.innerHTML + "<p class='chat-paragraph'>" +
                "<span class='chat-src-name'>" + that.srcName + ": </span>" + text + "</p>";
        }
    }

    function handleResponse(text) {
        // test if string is not just whitespace
        if (/\S/.test(text)) {
            // append new text to existing chat text
            that.textDisplay.innerHTML = that.textDisplay.innerHTML + "<p class='chat-paragraph'>" +
                "<span class='chat-dest-name'>" + that.dstName + ": </span>" + text + "</p>";

            that.scrollToBottom();
        }

    }

    // if a connection callback function has been provided, let it know
    // the current connection status
    function updateConnectionCallback(){
        if(that.connectionCallback){
            that.connectionCallback(that.getIsConnected());
        }
    }

    /* Set up peerjs connection handling for this chat session */
    this.peer.on('connection', connect);
    function connect(c) {
        console.log("Opening connection");
        isConnected = true;
        updateConnectionCallback();
        conn = c;
        conn.on('data', function (data) {
            console.log(data);
            handleResponse(data);
        });
        conn.on('close', function (err) {
            isConnected = false;
            handleInput('Your chat buddy has disconnected :(');
            updateConnectionCallback();
        });


    }

    // scroll chat window to most recent text
    this.scrollToBottom = function() {
        that.textDisplay.scrollTop = that.textDisplay.scrollHeight;
    }

    // returns to current text in the chat window
    this.getText = function(){
        return that.textDisplay.innerHTML;
    }

    // sets the chat window to have this text
    this.setText = function(text){
        that.textDisplay.innerHTML = text;
    }

    // Attempts to open a peerjs connection if the connection is currently closed,
    // and an id has been provided
    this.openConnection = function() {
        if (that.dstId && !that.getIsConnected()) {
            console.log("connecting to "+that.dstId);
            var c = that.peer.connect(that.dstId);
            c.on('open', function () {
                connect(c);
            });
            c.on('error', function (err) {
                console.log("Connection error: "+err);
            });
        }
    }

    this.getIsConnected = function() {
        return isConnected;
    }

    // if the connection is open, close it
    this.disconnect = function(){
        if(isConnected){
            conn.close();
            //isConnected = false;
            //updateConnectionCallback();
        }
    }

    // Finish by attempting to open a connection if applicable
    this.openConnection();
}

// Returns the main div container for the chat session
ChatSession.prototype.getContainer = function () {
    return this.mainContainer;
}



