/*
 Creates a chat window with a unique key to talk
 to a visitor.
 */
function ChatSession(srcName, dstName) {
    this.srcName = srcName;
    this.dstName = dstName;
    var that = this;

    // parent div to display chat session
    this.mainContainer = document.createElement('DIV');

    // add div to display chat text
    var textDisplay;
    textDisplay = document.createElement('DIV');
    textDisplay.className = 'chat-display';
    this.mainContainer.appendChild(textDisplay);

    // put initial text in the display window
    textDisplay.innerHTML = "Questions or feedback? We're online and ready to help you!";

    // add box for text entry
    var textInput;
    textInput = document.createElement('textarea');
    textInput.className = 'chat-entry';
    textInput.setAttribute('placeholder', 'Type and hit enter to chat');
    this.mainContainer.appendChild(textInput);

    // add listener to text input. Capture text when enter is pressed
    var reset = false;
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
            textDisplay.scrollTop = textDisplay.scrollHeight;
        } else {
            return;
        }
    }

// This function is passed any text that the user inputs
    function handleInput(text) {
        // test if string is not just whitespace
        if (/\S/.test(text)) {
            // append new text to existing chat text
            textDisplay.innerHTML = textDisplay.innerHTML + "<p class='chat-paragraph'>" +
                "<span class='chat-src-name'>" + that.srcName + ": </span>" + text + "</p>";
        }
    }
}

// Returns the main div container for the chat session
ChatSession.prototype.getContainer = function () {
    return this.mainContainer;
}

// Takes response text and updates the chat session
ChatSession.prototype.handleResponse = function (text) {
    // test if string is not just whitespace
    if (/\S/.test(text)) {
        // append new text to existing chat text
        clientChatDisplay.innerHTML = clientChatDisplay.innerHTML + "<p class='chat-paragraph'>" +
            "<span class='chat-dest-name'>" + this.dstName + ": </span>" + text + "</p>";
    }
}