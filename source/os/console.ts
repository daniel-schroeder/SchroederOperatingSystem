///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public possibleCommands = [],
                    public possibleCommandsCounter = 0,
                    public secondaryCommandList = [],
                    public secondaryCommandCounter = 0,
                    public previousBuffers = [],
                    public prevBuffersPosition = previousBuffers.length,
                    public numLines = 1) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    this.previousBuffers[this.previousBuffers.length] = this.buffer;
                    this.prevBuffersPosition = this.previousBuffers.length;
                    // ... and reset our buffer, possible command list, and counters for possible commands.
                    this.possibleCommands = [];
                    this.possibleCommandsCounter = 0;
                    this.secondaryCommandList = [];
                    this.secondaryCommandCounter = 0;
                    this.buffer = "";
                    this.numLines = 1;
                } else if (chr === String.fromCharCode(8)) { // backspace key
                    this.removeText();
                    //reset the possible commands array and counter so that tab works properly
                    this.possibleCommands = [];
                    this.possibleCommandsCounter = 0;

                    //remove the charqcter from the buffer
                    this.buffer = this.buffer.substring(0,this.buffer.length-1);
                } else if (chr === String.fromCharCode(9)) { // tab key
                    //clear the line and add a new prompt
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0
                    _OsShell.putPrompt();

                    //special case for man function
                    if (this.buffer.indexOf("man ") == 0 || this.buffer.indexOf("man") == 0) {
                        var startOfCommand = "man ";

                        //only run the autocomplete function if the array containing possible commands is empty
                        if (this.secondaryCommandList.length == 0 && this.buffer.length > 3) {
                            this.autoComplete(this.buffer.substring(4));
                        }
                        else {
                            this.autoComplete(" ")
                        }
                        console.log(this.buffer);
                        console.log(this.secondaryCommandList);
                        console.log(this.buffer.length);
                        //iterate through the array. if the counter is greater than the last index, reset to 0
                        if(this.secondaryCommandCounter >= this.secondaryCommandList.length) {
                            this.secondaryCommandCounter = 0;
                        }

                        var endOfCommand = this.secondaryCommandList[this.secondaryCommandCounter];
                        var completeCommand = startOfCommand + endOfCommand;
                        this.secondaryCommandCounter++;
                        this.putText(completeCommand);
                        this.buffer = completeCommand;
                    }
                    else {
                        //only run the autocomplete function if the array containing possible commands is empty
                        if (this.possibleCommands.length == 0) {
                            this.autoComplete(this.buffer);
                        }

                        //iterate through the array. if the counter is greater than the last index, reset to 0
                        if(this.possibleCommandsCounter >= this.possibleCommands.length) {
                            this.possibleCommandsCounter = 0;
                        }
                        var fullCommand = this.possibleCommands[this.possibleCommandsCounter];
                        this.possibleCommandsCounter++;

                        //fill the buffer with the command and put it on the canvas
                        this.putText(fullCommand);
                        this.buffer = fullCommand;
                    }
                } else if (chr == "up") { // up arrow key
                    //clear the line and add a new prompt
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0
                    _OsShell.putPrompt();

                    //recall last command
                    var pastCommand = this.getPreviousCommand();
                    this.putText(pastCommand);
                    this.buffer = pastCommand;
                } else if (chr == "down") { // down arrow key
                    //clear the line and add a new prompt
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0
                    _OsShell.putPrompt();

                    //recall command
                    var nextCommand = this.getNextCommand();
                    this.putText(nextCommand);
                    this.buffer = nextCommand;
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                if (this.currentXPosition + _DrawingContext.measureText(this.currentFont, this.currentFontSize, text) > _Canvas.width) {
                    //if text contains two or more letters check each letter one at a time
                    if (text.length >= 2) {
                        //used to check each letter of text
                        var a = 0;
                        var b = 1;

                        //ensure the whole array is checked and a is never larger than b
                        while (b < text.length && a < b) {
                            //if the letter is too big to fit advance line and put it there
                            if (this.currentXPosition + _DrawingContext.measureText(this.currentFont, this.currentFontSize, text.substring(a,b)) > _Canvas.width) {
                                this.advanceLine();
                                // Draw the text at the current X and Y coordinates.
                                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text.substring(a,b));
                                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text.substring(a,b));
                                // Move the current X position.
                                this.currentXPosition = this.currentXPosition + offset;
                                this.numLines++;
                            }
                            //otherwise put it in the next spot
                            else {
                                // Draw the text at the current X and Y coordinates.
                                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text.substring(a,b));
                                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text.substring(a,b));
                                // Move the current X position.
                                this.currentXPosition = this.currentXPosition + offset;
                            }
                            //advance the counters
                            a++;
                            b++;
                        }
                    }
                    //if its just one character, advance line and put the text there
                    else {
                        this.advanceLine();
                        // Draw the text at the current X and Y coordinates.
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                        var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                        // Move the current X position.
                        this.currentXPosition = this.currentXPosition + offset;
                        this.numLines++;
                    }
                }
                //if it doesnt go beyond the limit of the canvas just put it normally on the command line
                else {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        }

        //finishes a command for the user
        public autoComplete(text): string [] {
            if (text != "") {
                //iterates throught the list of commands to check if what
                //the user entered is a valid start to a command
                for (var i = 0; i < _OsShell.commandList.length; i++) {
                    if (_OsShell.commandList[i].command.indexOf(text) == 0) {
                        //if it is set the value of newText to the command name
                        this.possibleCommands[this.possibleCommands.length] = _OsShell.commandList[i].command;
                        this.secondaryCommandList[this.secondaryCommandList.length] = _OsShell.commandList[i].command;
                    }
                }
            }
            if (this.possibleCommands.length == 0) {
                for (var i = 0; i < _OsShell.commandList.length; i++) {
                    this.possibleCommands[i] = _OsShell.commandList[i].command
                    this.secondaryCommandList[i] = _OsShell.commandList[i].command
                }
            }
            return this.possibleCommands;
        }

        //gets the previous commands entered by user starting witht the most recent
        public getPreviousCommand(): string {
            var newText = "";
            //the if statement ensures that there was at least one command entered previously
            if (this.prevBuffersPosition > 0) {
                this.prevBuffersPosition--;
                newText = this.previousBuffers[this.prevBuffersPosition];
            }
            //returns the previous command
            return newText;
        }

        //very similar to the getPreviousCommand function but it goes through
        //the previous commands in the opposite direction
        public getNextCommand(): string {
            var newText = "";
            if (this.prevBuffersPosition < this.previousBuffers.length) {
                this.prevBuffersPosition++;
                newText = this.previousBuffers[this.prevBuffersPosition];
            }
            return newText;
        }

        //removes the most recent letter entered
        public removeText(): void {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.substring(this.buffer.length-1));
            var width = _Canvas.width;
            var height = (_DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin);
            if (this.currentXPosition > 5) {
                //set the appropriate x and y coordinates
                var x = this.currentXPosition - offset;
                var y = this.currentYPosition - this.currentFontSize - 1;

                //clears the text and then puts the cursor back to the previous location
                _DrawingContext.clearRect(x, y, width, height);
                this.currentXPosition = this.currentXPosition - offset;
            } else {
                //remove all text from previous lines
                while (this.numLines > 1) {
                    this.currentYPosition -= (_DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin);
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.numLines--;
                }
                this.currentXPosition = 0
                _OsShell.putPrompt();

                //put all text back
                //used to reset this.currentXPosition
                this.putText(this.buffer);

                //set the appropriate x and y coordinates
                var x = this.currentXPosition - offset;
                var y = this.currentYPosition - this.currentFontSize - 1;

                //clears the text and then puts the cursor back to the previous location
                _DrawingContext.clearRect(x, y, width, height);
                this.currentXPosition = this.currentXPosition - offset;
            }

        }

        public advanceLine(): void {
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
        }
    }
 }
