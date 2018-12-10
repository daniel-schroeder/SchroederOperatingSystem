///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            //Date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Returns the date.");
            this.commandList[this.commandList.length] = sc;

            //whereAmI
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  "- Returns the user location.");
            this.commandList[this.commandList.length] = sc;

            //funFact
            sc = new ShellCommand(this.shellFunFact,
                                  "funfact",
                                  "- Displays a fun fact.");
            this.commandList[this.commandList.length] = sc;

            //status <string>
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Displays a status equal to <string>.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Checks to see if the user code is valid.");
            this.commandList[this.commandList.length] = sc;

            //bsod
            sc = new ShellCommand(this.shellBSOD,
                                  "bsod",
                                  "- Displays blue screen of death.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            //run <pid>
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "<pid> - Process id of process to run.");
            this.commandList[this.commandList.length] = sc;

            //kill <pid>
            sc = new ShellCommand(this.shellKill,
                                  "kill",
                                  "<pid> - Process id of process to kill.");
            this.commandList[this.commandList.length] = sc;

            //clearmem
            sc = new ShellCommand(this.shellClearMem,
                                  "clearmem",
                                  " - Clears memory.");
            this.commandList[this.commandList.length] = sc;

            //runall
            sc = new ShellCommand(this.shellRunAll,
                                  "runall",
                                  " - Runs all processes in memory.");
            this.commandList[this.commandList.length] = sc;

            //ps
            sc = new ShellCommand(this.shellPS,
                                  "ps",
                                  " - Shows all processes in memory.");
            this.commandList[this.commandList.length] = sc;

            //quantum
            sc = new ShellCommand(this.shellQuantum,
                                  "quantum",
                                  "<int> - set the length of the quantum.");
            this.commandList[this.commandList.length] = sc;

            //killall <pid>
            sc = new ShellCommand(this.shellKillAll,
                                  "killall",
                                  " - Kills all processes.");
            this.commandList[this.commandList.length] = sc;

            //create <filename>
            sc = new ShellCommand(this.shellCreate,
                                  "create",
                                  "<filename> - Creates new file <filename>.");
            this.commandList[this.commandList.length] = sc;

            //read <filename>
            sc = new ShellCommand(this.shellRead,
                                  "read",
                                  "<filename> - Reads and displays contents of <filename>.");
            this.commandList[this.commandList.length] = sc;

            //write <filename>, "text"
            sc = new ShellCommand(this.shellWrite,
                                  "write",
                                  "<filename>, \"text\" - writes \"text\" to <filename>.");
            this.commandList[this.commandList.length] = sc;

            //delete <filename>
            sc = new ShellCommand(this.shellDelete,
                                  "delete",
                                  "<filename> - Removes <filename> from storage.");
            this.commandList[this.commandList.length] = sc;

            //format
            sc = new ShellCommand(this.shellFormat,
                                  "format",
                                  " - Initializes all blocks in all sectors in all tracks.");
            this.commandList[this.commandList.length] = sc;

            //ls
            sc = new ShellCommand(this.shellLs,
                                  "ls",
                                  " - Shows all files on disk.");
            this.commandList[this.commandList.length] = sc;

            //setschedule <schedule>
            sc = new ShellCommand(this.shellSetSchedule,
                                  "setschedule",
                                  "<schedule> - Sets scheduling algoritm to <schedule>.");
            this.commandList[this.commandList.length] = sc;

            //getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                                  "getschedule",
                                  " - Gets the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        //gives the version name and number of the OS
        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        //Displays a list of valid commands
        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        //shuts down the OS
        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
             _CPU.isExecuting = false;
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        //clears the command line
        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        //gives a short description of how to use a command
        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Displays the current version data.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("<topic> - Displays the MANual page for <topic>.");
                        break;
                    case "trace":
                        _StdOut.putText("<on | off> - Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("<string> - Does rot13 obfuscation on <string>.");
                        break;
                    case "prompt":
                        _StdOut.putText("<string> - Sets the prompt.");
                        break;
                    case "date":
                        _StdOut.putText("Returns the date.");
                        break;
                    case "whereami":
                        _StdOut.putText("Returns the user location.");
                        break;
                    case "funfact":
                        _StdOut.putText("Displays a fun fact.");
                        break;
                    case "status":
                        _StdOut.putText("<string> - displays <string> in status area.");
                        break;
                    case "load":
                        _StdOut.putText("Lets user know if code entered in input area is valid.");
                        break;
                    case "bsod":
                        _StdOut.putText("Tests the BSOD.");
                        break;
                    case "run":
                        _StdOut.putText("<pid> - Runs the process with process id of <pid>.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears memory.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all processes in memory.");
                        break;
                    case "ps":
                        _StdOut.putText("shows the PID of all processes in memory.");
                        break;
                    case "kill":
                        _StdOut.putText("<pid> - Kills the process with process id of <pid>.");
                        break;
                    case "killall":
                        _StdOut.putText("Kills all processes.");
                        break;
                    case "quantum":
                        _StdOut.putText("<int> - Sets the quantum to <int>.");
                        break;
                    case "create":
                        _StdOut.putText("<filename> - creates file <filename>.");
                        break;
                    case "read":
                        _StdOut.putText("<filename> - Reads and displays contents of <filename>.");
                        break;
                    case "write":
                        _StdOut.putText("<filename> \"text\" - Writes \"text\" to <filename>.");
                        break;
                    case "delete":
                        _StdOut.putText("<filename> - Removes <filename> from storage.");
                        break;
                    case "format":
                        _StdOut.putText("Initializes all blocks in all sectors in all tracks.");
                        break;
                    case "ls":
                        _StdOut.putText("Lists all files on disk.");
                        break;
                    case "setschedule":
                        _StdOut.putText("<schedule> - Sets the scheduling algoritm to <schedule>.");
                        break;
                    case "getschedule":
                        _StdOut.putText("Gets the current scheduling algorithm.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        //turns on or off the tracing
        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        //shifts the letters in a word 13 to confuse people
        //sorta encryption
        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        //changes the prompt of the shell
        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        //returns the date
        public shellDate() {
            var today = new Date();
            var date = ((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear());
            if (today.getSeconds() < 10) {
                var seconds = "0" + today.getSeconds();
            }
            else {
                var seconds = "" + today.getSeconds();
            }
            if (today.getMinutes() < 10) {
                var minutes = "0" + today.getMinutes();
            }
            else {
                var minutes = "" + today.getMinutes();
            }
            if (today.getHours() > 12) {
                var hours = today.getHours() - 12;
            }
            else {
                var hours = today.getHours();
            }
            var time = (hours + ":" + minutes + ":" + seconds);
            _StdOut.putText("Todays date is " + date);
            _StdOut.advanceLine();
            _StdOut.putText("The current time is " + time);
        }

        //tells where you are
        public shellWhereAmI() {
            _StdOut.putText("You tell me");
        }

        //gives a fun fact
        //not necessarily useful
        public shellFunFact() {
            var fact = Math.floor(Math.random() * 5);
            switch (fact) {
                case 0:
                    _StdOut.putText("Banging your head against the wall for one hour burns 150 calories.");
                    break;
                case 1:
                    _StdOut.putText("A single cloud can weight more than 1 million pounds.");
                    break;
                case 2:
                    _StdOut.putText("Cherophobia is the fear of fun.");
                    break;
                case 3:
                    _StdOut.putText("A ten-gallon hat will only hold three quarters of a gallon.");
                    break;
                case 4:
                    _StdOut.putText("Russia has a larger surface area than Pluto.");
                    break;
                default:
                    _StdOut.putText("fake news");
            }
        }

        //set the status display
        public shellStatus(args) {
            if (args.length > 0) {
                var status = "";
                for (var i = 0; i < args.length; i++) {
                    status = status + args[i] + " ";
                }
                document.getElementById("status").innerHTML = "Status: " + status;
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a status.");
            }
        }

        //check if the text in the user input area is valid and load into memory
        public shellLoad(args) {
            var userInput = document.getElementById("taProgramInput").value;
            //check validity
            if (userInput.match(/^[a-fA-f 0-9]+$/)) {
                var priority;
                if (args[0] != undefined) {
                    priority = parseInt(args[0]);
                    if (isNaN(priority)) {
                        _StdOut.putText("Priority must be a number.");
                        priority == null;
                    }
                }
                if (_MemoryManager.partitionOneFree ||
                    _MemoryManager.partitionTwoFree ||
                    _MemoryManager.partitionThreeFree) {
                    //loadProgram
                    _MemoryManager.loadProgram(userInput.split(" "));

                    //create a new pcb for process and store it in _PCB
                    _PCB = new TSOS.ProcessControlBlock();
                    //initialize _PCB
                    _PCB.init(priority);
                    _PCB.state = "Resident";
                    _CPU.thePCB = _PCB;
                    //store _PCB into _ResidentQ
                    _ResidentQ.push(_PCB);
                    _Kernel.addRowToMasterQTable();
                    _StdOut.putText("Process id = " + _PCB.pid);
                } else {
                    //load onto disk instead
                    _PCB = new TSOS.ProcessControlBlock();
                    //initialize _PCB
                    _PCB.init(priority, 4);
                    _PCB.state = "Resident";
                    _CPU.thePCB = _PCB;
                    //store _PCB into _ResidentQ
                    _ResidentQ.push(_PCB);
                    _krnFSDriver.createFile(["~" + _PCB.pid.toString()]);
                    _PCB.tsb = _krnFSDriver.findInDirectory(["~" + _PCB.pid.toString()])
                    _krnFSDriver.writeUserInputToDisk("~" + _PCB.pid.toString(), userInput.split(" "));
                    _Kernel.addRowToMasterQTable();
                    _StdOut.putText("Process id = " + _PCB.pid);
                }
            } else {
                _StdOut.putText("Text in input area is not valid code");
            }
        }

        //run program in memory
        public shellRun(args) {
            //check for a pid given
            if (args.length > 0) {
                //make sure the resident Q isnt empty
                if (_ResidentQ.length > 0) {
                    var test;
                    var found = false;
                    for (var i = _ResidentQ.length - 1; i >= 0; i--) {
                        test = _ResidentQ[i];
                        //test to see if the pid matches the given pid
                        if (test.pid == args) {
                            //move the process from resident queue to ready queue
                            _ReadyQ.push(test);
                            //remove the process from the resident queue
                            _ResidentQ.splice(i,1);
                            found = true;
                        }
                    }
                    if (found == false) {
                        //message for if pid given not ok
                        _StdOut.putText("Unable to run process " + args + ".")
                        _StdOut.advanceLine();
                        _StdOut.putText("Either no longer in memory, or never loaded.");
                    }
                    else {
                        //set _PCB to the most recent _PCB in _ReadyQ
                        _PCB = _ReadyQ[(_ReadyQ.length - 1)];
                        _CPU.thePCB = _PCB;
                        _CPUScheduler.processes.push(_PCB);
                        //if single step is on, do one cycle then wait
                        if (_SingleStep) {
                            _PCB.state = "Running";
                            _ShouldRun = true;
                            _CPU.cycle();
                        }
                        //otherwise run free
                        else {
                            _PCB.state = "Running";
                            _ShouldRun = true;
                            _CPU.isExecuting = true;
                        }
                    }
                }
                //message for if pid given not in memory
                else {
                    _StdOut.putText("No processes in memory")
                    _StdOut.advanceLine();
                    _StdOut.putText("Load a process first.");
                }
            }
            //error in case pid is not given at all
            else {
                _StdOut.putText("Usage: run <pid>  Please supply a process id.");
            }
        }

        //clears memory
        public shellClearMem() {
            _MemoryManager.clearMem();
            _ResidentQ.splice(0,_ResidentQ.length);
        }

        //runs all processes
        public shellRunAll() {
            //make sure the resident q is not empty
            if (_ResidentQ.length > 0) {
                _CPUScheduler.runAll();
                _ResidentQ.splice(0,_ResidentQ.length);
            }
            //if it is let the user know
            else {
                _StdOut.putText("Memory is empty. Load a program first");
            }
        }

        //shows all processes in memory
        public shellPS() {
            var temp;
            _StdOut.putText("Resident:")
            _StdOut.advanceLine();
            //Go through the resident Q and display processes there
            for (var i = 0; i < _ResidentQ.length; i++) {
                temp = _ResidentQ[i];
                _StdOut.putText("PID " + temp.pid);
                _StdOut.advanceLine();
            }
            _StdOut.putText("Running:")
            _StdOut.advanceLine();
            //then go through the ready Q and display processes there
            for (var i = 0; i < _ReadyQ.length; i++) {
                temp = _ReadyQ[i];
                _StdOut.putText("PID " + temp.pid);
                _StdOut.advanceLine();
            }
        }

        //kills a process
        public shellKill(args) {
            if (args.length > 0) {
                _CPUScheduler.kill(args);
            } else {
                _StdOut.putText("Usage: kill <pid>  Please supply a PID.");
            }
        }

        //kills a process
        public shellKillAll() {
            _CPUScheduler.killAll();
        }

        //Creates file <filename>
        public shellCreate(args) {
            if (args.length > 0) {
                if (args != "") {
                    if (args[0].substring(0,1) != "~") {
                        var status = _krnFSDriver.createFile(args);
                        switch (status) {
                            case 1:
                                _StdOut.putText("File already exists");
                                break;
                            case 2:
                                _StdOut.putText("Not enough space on disk");
                                break;
                            case 3:
                                _StdOut.putText("File created successfully");
                                break;
                            case 4:
                                _StdOut.putText("File created successfully but name shortened because it was too long");
                                break;
                        }
                    } else {
                        _StdOut.putText("Please dont start a file name with \"~\"");
                    }
                }
            } else {
                _StdOut.putText("Usage: create <filename>  Please supply a filename.");
            }
        }

        //Read and display contents of file <filename>
        public shellRead(args) {
            if (args.length > 0) {
                _StdOut.putText(_krnFSDriver.readFromDisk(args[0]));
            } else {
                _StdOut.putText("Usage: read <filename>  Please supply a filename.");
            }
        }

        //Write data inside "" to file <filename>
        public shellWrite(args) {
            if (args.length > 0) {
                if (args.length >= 2) {
                    if (args[1].substring(0,1) == '"' && args[args.length-1].charAt(args[args.length-1].length-1) == '"') {
                        var text = args.slice(1).join(" ");
                        _krnFSDriver.writeToDisk(args[0], text);
                    } else {
                        _StdOut.putText("Please enclose what you're writing to the file in double quotes (\").");
                    }
                } else {
                    _StdOut.putText("Not the proper number of parameters. Two is what we're looking for.");
                }
            } else {
                _StdOut.putText("Usage: write <filename> \"text\" Please supply a filename and some text enclosed in quotes.");
            }
        }

        //Deletes file <filename>
        public shellDelete(args) {
            if (args.length > 0) {
                _krnFSDriver.deleteFile(args[0]);
            } else {
                _StdOut.putText("Usage: delete <filename>  Please supply a filename.");
            }
        }

        //Initialize all blocks in all sectors in all tracks
        public shellFormat() {
            if (_ReadyQ.length > 0) {
                _StdOut.putText("Please terminate all processes before fomating.");
            } else {
                _Disk.formatDisk();
            }
        }

        //List all files on disk
        public shellLs() {
            var files = _krnFSDriver.getAllFiles();
            for (var i = 0; i < files.length; i++) {
                _StdOut.putText(files[i]);
                _StdOut.advanceLine();
            }
        }

        //set scheduling algorithm to <schedule>
        public shellSetSchedule(args) {
            if (args.length > 0) {
                switch (args[0]) {
                    case "rr":
                        _CPUScheduler.setSchedule("rr")
                        break;
                    case "priority":
                    _CPUScheduler.setSchedule("priority")
                        break;
                    case "fcfs":
                    _CPUScheduler.setSchedule("fcfs")
                        break;
                    default:
                        _StdOut.putText("Please use rr for round robin, fcfs for first come first serve, or priority for priority.");
                        break;
                }
            } else {
                _StdOut.putText("Usage: setschedule <schedule>  Please supply a schedule.");
            }
        }

        //gets current scheduling algorithm
        public shellGetSchedule() {
            _StdOut.putText("Current schedule is: " + _CPUScheduler.getSchedule() + ".");
        }

        //sets quantum
        public shellQuantum(args) {
            if (args.length > 0) {
                _CPUScheduler.setQuantum(args);
                _StdOut.putText("Quantum set to " + args);
                _StdOut.advanceLine();
            } else {
                _StdOut.putText("Usage: quantum <int>  Please supply a quantum size.");
            }
        }

        //tests the BLUE SCREEN OF DEATH
        public shellBSOD() {
            _Kernel.krnTrapError("BSOD");
        }
    }
}
