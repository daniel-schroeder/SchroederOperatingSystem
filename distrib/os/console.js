///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, previousBuffers, prevBuffersPosition) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (previousBuffers === void 0) { previousBuffers = []; }
            if (prevBuffersPosition === void 0) { prevBuffersPosition = previousBuffers.length; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.previousBuffers = previousBuffers;
            this.prevBuffersPosition = prevBuffersPosition;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.previousBuffers[this.previousBuffers.length] = this.buffer;
                    this.prevBuffersPosition = this.previousBuffers.length;
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { // backspace key
                    this.removeText();
                    //remove the charqcter from the buffer
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                else if (chr === String.fromCharCode(9)) { // tab key
                    var fullCommand = this.autoComplete(this.buffer);
                    //fill the buffer with the whole command
                    this.putText(fullCommand);
                    this.buffer += fullCommand;
                }
                else if (chr == "up") { // up arrow key
                    //clear the line and add a new prompt
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0;
                    _OsShell.putPrompt();
                    //recall last command
                    var pastCommand = this.getPreviousCommand();
                    this.putText(pastCommand);
                    this.buffer = pastCommand;
                }
                else if (chr == "down") { // down arrow key
                    //clear the line and add a new prompt
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0;
                    _OsShell.putPrompt();
                    //recall command
                    var nextCommand = this.getNextCommand();
                    this.putText(nextCommand);
                    this.buffer = nextCommand;
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        //finishes a command for the user
        Console.prototype.autoComplete = function (text) {
            var newText = "";
            if (text != "") {
                //iterates throught the list of commands to check if what
                //the user entered is a valid start to a command
                for (var i = 0; i < _OsShell.commandList.length; i++) {
                    if (_OsShell.commandList[i].command.indexOf(text) == 0) {
                        //if it is set the value of newText to the command name
                        newText = _OsShell.commandList[i].command;
                    }
                }
            }
            //new text only needs to contain the text not entered by user
            //thats what this substring is for
            newText = newText.substring(text.length);
            return newText;
        };
        //gets the previous commands entered by user starting witht the most recent
        Console.prototype.getPreviousCommand = function () {
            var newText = "";
            //the if statement ensures that there was at least one command entered previously
            if (this.prevBuffersPosition > 0) {
                this.prevBuffersPosition--;
                newText = this.previousBuffers[this.prevBuffersPosition];
            }
            //returns the previous command
            return newText;
        };
        //very similar to the getPreviousCommand function but it goes through
        //the previous commands in the opposite direction
        Console.prototype.getNextCommand = function () {
            var newText = "";
            if (this.prevBuffersPosition < this.previousBuffers.length) {
                this.prevBuffersPosition++;
                newText = this.previousBuffers[this.prevBuffersPosition];
            }
            return newText;
        };
        //removes the most recent letter entered
        Console.prototype.removeText = function () {
            if (this.currentXPosition > 1) {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.substring(this.buffer.length - 1));
                var x = this.currentXPosition - offset;
                var y = this.currentYPosition - this.currentFontSize - 2;
                var width = offset;
                var height = this.currentFontSize + 7;
                //clears the text and then puts the cursor back to the previous location
                _DrawingContext.clearRect(x, y, width, height);
                this.currentXPosition = this.currentXPosition - offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _Canvas.height) {
                //copy the console screen to a variable
                var consolesText = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                //clear the console
                this.clearScreen();
                //paste the copied screen onto the clear screen
                //must multiply y value by -1 so it doesnt scroll from the top
                _DrawingContext.putImageData(consolesText, 0, (_DefaultFontSize +
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin) * -1);
                //set currentYPosition back to bottom of screen so its not off the console
                this.currentYPosition -= (_DefaultFontSize +
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin);
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
