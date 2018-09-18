///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module DSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public previousBuffers = [],
                    public prevBuffersPosition = previousBuffers.length) {
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
                    // ... and reset our buffer.
                    this.previousBuffers[this.previousBuffers.length] = this.buffer;
                    this.prevBuffersPosition = this.previousBuffers.length;
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { //     backspace key
                    this.removeText();
                    this.buffer = this.buffer.substring(0,this.buffer.length-1);
                } else if (chr === String.fromCharCode(9)) { //     tab key
                    var fullCommand = this.autoComplete(this.buffer);
                    this.putText(fullCommand);
                    this.buffer += fullCommand;
                }
                else if (chr === String.fromCharCode(38)) { //     up arrow key
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0
                    _OsShell.putPrompt();
                    var pastCommand = this.getPreviousCommand();
                    this.putText(pastCommand);
                    this.buffer = pastCommand;
                }
                else if (chr === String.fromCharCode(40)) { //     down arrow key
                    _DrawingContext.clearRect(0, (this.currentYPosition - this.currentFontSize), _Canvas.width, _Canvas.height);
                    this.currentXPosition = 0
                    _OsShell.putPrompt();
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
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }

        //finishes a command for the user
        public autoComplete(text): string {
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
            if (this.currentXPosition > 1) {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.substring(this.buffer.length-1));
                var x = this.currentXPosition - offset;
                var y = this.currentYPosition - this.currentFontSize;
                var width = offset;
                var height = this.currentFontSize + 5;

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
