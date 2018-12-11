///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var FSDeviceDriver = /** @class */ (function (_super) {
        __extends(FSDeviceDriver, _super);
        function FSDeviceDriver() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnFSDriverEntry;
            return _this;
        }
        FSDeviceDriver.prototype.krnFSDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        };
        //Gets all file names and puts them in an array which is returned
        FSDeviceDriver.prototype.getAllFiles = function () {
            var filenames = new Array();
            //goes through each sector and block in track 0
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    var name = _Disk.readStringFromDisk([0, sector, block]);
                    //if name isnt empty we add it to the array of names to return
                    if (name.length != 0) {
                        filenames.push(name);
                    }
                }
            }
            return filenames;
        };
        //finds the next open block for data to be stored
        FSDeviceDriver.prototype.findOpenBlock = function () {
            var tsb;
            //goes through all track sector block combos starting with 1:0:0
            for (var track = 1; track < _Disk.numTracks; track++) {
                for (var sector = 0; sector < _Disk.numSectors; sector++) {
                    for (var block = 0; block < _Disk.numblocks; block++) {
                        tsb = [track, sector, block];
                        var data = _Disk.readFromDisk(tsb);
                        //if the in use byte is 00 its not in use so thats the next open block
                        if (data[0] + data[1] == "00") {
                            return tsb;
                        }
                    }
                }
            }
        };
        //finds a file within the directory. returns the tsb if it finds it or -1 if it doesnt
        FSDeviceDriver.prototype.findInDirectory = function (filename) {
            var tsb;
            var fileExists = false;
            //go through the directory looking at each tsb combo
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8; //after initial bytes for in use and next tsb
                    var i = 0;
                    //a check to see if it is in use
                    if (data[0] + data[1] == "01") {
                        //if it is see if the files name matches filename
                        while (i < filename[0].length) {
                            if (filename[0].substring(i, i + 1) == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                //if a letter matches, we must move the counter for data 2 places because we check 2 for each letter
                                j += 2;
                            }
                            else {
                                break;
                            }
                            i++;
                        }
                        //make sure there isnt more for either the file in the directory or the given filename
                        if (data[j] + data[j + 1] == "00" && filename[0].substring(i, i + 1) == "") {
                            fileExists = true;
                        }
                        //return tsb if dile is found found
                        if (fileExists) {
                            return tsb;
                        }
                    }
                }
            }
            //file not found
            return -1;
        };
        //finds the next open spot in the directory. returns the tsb if it finds on or -1 if it doesnt
        FSDeviceDriver.prototype.findSpotInDirectory = function (filename) {
            var tsb = this.findInDirectory(filename);
            //if -1 is returned find a new space for the file to go
            if (tsb == -1) {
                //cycle through all tsb in track 0
                for (var sector = 0; sector < _Disk.numSectors; sector++) {
                    for (var block = 0; block < _Disk.numblocks; block++) {
                        //dont want to check 0:0:0
                        if (sector == 0 && block == 0) {
                            block++;
                        }
                        tsb = [0, sector, block];
                        var data = _Disk.readFromDisk(tsb);
                        //if in use bytes not in use, use it
                        if (data[0] + data[1] == "00") {
                            return tsb;
                        }
                    }
                }
            }
            else {
                //if -1 is not returned, return -1 to say it already exists
                return -1;
            }
        };
        //creates a file by putting a pointer in the directory and initializing a block with
        //an in use byte
        FSDeviceDriver.prototype.createFile = function (filename) {
            var tsbForDirectory = this.findSpotInDirectory(filename[0]);
            //if file is already there
            if (tsbForDirectory == -1) {
                return 1;
            }
            var tsbForData = this.findOpenBlock();
            //if there is no more space in file system
            if (tsbForData == null) {
                return 2;
            }
            //in use byte and nextTSB added
            var name = "010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2];
            for (var i = 0; i < filename[0].length; i++) {
                //rest of data added to temp string
                name += filename[0].charCodeAt(i).toString(16);
            }
            if (name.length > (_Disk.blockSize * 2)) {
                //truncated name if its too long
                name = name.substring(0, (_Disk.blockSize * 2));
                //writes the name of the file in the directory
                _Disk.writeToDisk(tsbForDirectory, name);
                //initializes a block in the file system to be used for the file
                _Disk.writeToDisk(tsbForData, ("010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2]));
                return 4;
            }
            //writes the name of the file in the directory
            _Disk.writeToDisk(tsbForDirectory, name);
            //initializes a block in the file system to be used for the file
            _Disk.writeToDisk(tsbForData, ("010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2]));
            return 3;
        };
        //reads data from the disk
        FSDeviceDriver.prototype.readFromDisk = function (filename) {
            var tsb = this.findInDirectory([filename]);
            if (tsb == -1) {
                //file not found
                return -1;
            }
            else {
                //tsb is the file name
                var data = _Disk.readFromDisk(tsb);
                //newTSB is the tsb of the contents of the file
                var newTSB = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                return _Disk.readStringFromDisk(newTSB);
            }
        };
        //deletes a file by first deleting the contents, then the directory pointer
        FSDeviceDriver.prototype.deleteFile = function (filename) {
            var tsb = this.findInDirectory([filename]);
            //clears contents of file
            var cleared = this.clearFile(filename);
            if (cleared == -1) {
                //error clearing file
                return -2;
            }
            else {
                if (tsb == -1) {
                    //file not found
                    return -1;
                }
                else {
                    //writes null value 0 to directory tsb
                    _Disk.writeToDisk(tsb, "");
                    return 0;
                }
            }
        };
        //clears file contents. If tsb is passed to it it doesnt need to get the tsb so it bypasses that
        FSDeviceDriver.prototype.clearFile = function (filename, tsb) {
            if (tsb === void 0) { tsb = null; }
            //if tsb is given no need to find it
            if (tsb != null) {
                var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
                if (data == null) {
                    //already clear
                    return;
                }
                else {
                    var nextData;
                    //writes null value 0 to each tsb in use by a file
                    do {
                        if (nextData != undefined) {
                            data = nextData;
                        }
                        nextData = sessionStorage.getItem(data[3] + ":" + data[5] + ":" + data[7]);
                        //write null value 0 to current tsb
                        _Disk.writeToDisk([data[3], data[5], data[7]], "");
                    } while ((data[3] != nextData[3]) || (data[5] != nextData[5]) || (data[7] != nextData[7]));
                    _Disk.writeToDisk([data[3], data[5], data[7]], "");
                }
            }
            else {
                //tsb is not given so we must find it
                var tsb = this.findInDirectory([filename]);
                var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
                if (tsb == -1) {
                    //file not found
                    return -1;
                }
                else {
                    var nextData;
                    //writes null value 0 to each tsb in use by a file
                    do {
                        if (nextData != null) {
                            data = nextData;
                        }
                        nextData = sessionStorage.getItem(data[3] + ":" + data[5] + ":" + data[7]);
                        //write null value 0 to current tsb
                        _Disk.writeToDisk([data[3], data[5], data[7]], "");
                    } while ((data[3] != nextData[3]) || (data[5] != nextData[5]) || (data[7] != nextData[7]));
                    _Disk.writeToDisk([nextData[3], nextData[5], nextData[7]], "");
                }
            }
        };
        //writes to disk converting text to hex
        FSDeviceDriver.prototype.writeToDisk = function (filename, text) {
            var tsb = this.findInDirectory([filename]);
            if (tsb == -1) {
                //file not found
                return -1;
            }
            else {
                var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
                tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                //clear the file to start new. Does not delete file
                this.clearFile(filename, tsb);
                //initializes file with a 01 for in use byte
                _Disk.writeToDisk(tsb, "01");
                //lose the ""
                var trimmedText = text.substring(1, text.length - 1);
                var counter = 0;
                //if its too big find out how much too big
                if (trimmedText.length > _Disk.blockSize - 4) {
                    //get the next open block to put data in
                    var nextTSB = this.findOpenBlock();
                    //how many blocks do we need rounded up always of course
                    var numBlocksNeeded = Math.ceil(trimmedText.length / (_Disk.blockSize - 4));
                    for (var i = 0; i < numBlocksNeeded; i++) {
                        //if this is not the last block to be used, initialize next tsb bytes with next tsb
                        //if it is the last block to be used, initialize them with the current tsb
                        if ((i + 1) != numBlocksNeeded) {
                            var temp = "010" + nextTSB[0] + "0" + nextTSB[1] + "0" + nextTSB[2];
                            _Disk.writeToDisk(nextTSB, "01");
                        }
                        else {
                            var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                        }
                        for (var j = 0; j < _Disk.blockSize - 4; j++) {
                            //if counter passes the length of the text, end the loop
                            if (counter >= trimmedText.length) {
                                j = _Disk.blockSize;
                            }
                            else {
                                //otherwise get the char code in hex and add it to a temp string
                                temp += trimmedText.charCodeAt(counter).toString(16);
                                counter++;
                            }
                        }
                        //write that temp string to the disk
                        _Disk.writeToDisk(tsb, temp);
                        //set the current tsb to nextTSB
                        tsb = nextTSB;
                        //get a new nextTSB
                        nextTSB = this.findOpenBlock();
                    }
                }
                else { //data is not too long, just write it onto disk, same as above, just once
                    var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                    for (var i = 0; i < trimmedText.length; i++) {
                        temp += trimmedText.charCodeAt(i).toString(16);
                    }
                    _Disk.writeToDisk(tsb, temp);
                }
                return;
            }
        };
        //writes input from userInput text field to disk. does not convert because its already hex
        //very similar to writeToDisk but doesnt change letters into different hex values
        FSDeviceDriver.prototype.writeUserInputToDisk = function (filename, text) {
            var tsb = this.findInDirectory([filename]);
            if (tsb == -1) {
                return -1;
            }
            else {
                var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
                tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                this.clearFile(filename, tsb);
                _Disk.writeToDisk(tsb, "01");
                //text is sent to this function joined by a "," so we split on that and get an array
                //each element of the array is an op code
                text = text.toString().toLowerCase().split(",");
                var counter = 0;
                //same as prev function
                if (text.length > _Disk.blockSize - 4) {
                    var nextTSB = this.findOpenBlock();
                    var numBlocksNeeded = Math.ceil(text.length / (_Disk.blockSize - 4));
                    for (var i = 0; i < numBlocksNeeded; i++) {
                        if ((i + 1) != numBlocksNeeded) {
                            var temp = "010" + nextTSB[0] + "0" + nextTSB[1] + "0" + nextTSB[2];
                        }
                        else {
                            var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                        }
                        for (var j = 0; j < _Disk.blockSize - 4; j++) {
                            if (counter >= text.length) {
                                j = _Disk.blockSize;
                            }
                            else {
                                //dont change to hex because it is already
                                temp += text[counter];
                                counter++;
                            }
                        }
                        _Disk.writeToDisk(tsb, temp);
                        if ((i + 1) != numBlocksNeeded) {
                            _Disk.writeToDisk(nextTSB, "01");
                        }
                        tsb = nextTSB;
                        nextTSB = this.findOpenBlock();
                    }
                }
                else {
                    var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                    for (var i = 0; i < text.length; i++) {
                        temp += text[i];
                    }
                    _Disk.writeToDisk(tsb, temp);
                }
                return;
            }
        };
        //brings a file from the disk into memory
        FSDeviceDriver.prototype.rollIn = function (pcb) {
            var data = _Disk.readFromDisk([pcb.tsb[0], pcb.tsb[1], pcb.tsb[2]]);
            var tsbOfData = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
            var text = _Disk.readOpCodesFromDisk(tsbOfData);
            //all options do the same thing just in different partitions
            //set needToSwap to false, set location to partition,
            //clear the partition and set it to free,
            //get the base and limit of the process,
            //load the program with loadProgram
            if (_MemoryManager.partitionOneFree) {
                pcb.needToSwap = false;
                pcb.location = 0;
                _MemoryManager.partitionOneFree;
                _MemoryManager.clearMemPartition(0);
                pcb.base = pcb.getBase(0);
                pcb.limit = pcb.base + text.split(" ").length;
                _MemoryManager.loadProgram(text.split(" "));
            }
            else if (_MemoryManager.partitionTwoFree) {
                pcb.needToSwap = false;
                pcb.location = 1;
                _MemoryManager.partitionTwoFree;
                _MemoryManager.clearMemPartition(1);
                pcb.base = pcb.getBase(1);
                pcb.limit = pcb.base + text.split(" ").length;
                _MemoryManager.loadProgram(text.split(" "));
            }
            else if (_MemoryManager.partitionThreeFree) {
                pcb.needToSwap = false;
                pcb.location = 2;
                _MemoryManager.partitionThreeFree;
                _MemoryManager.clearMemPartition(2);
                pcb.base = pcb.getBase(2);
                pcb.limit = pcb.base + text.split(" ").length;
                _MemoryManager.loadProgram(text.split(" "));
            }
            else {
            }
        };
        //brings a file out of memory and puts it on the disk
        FSDeviceDriver.prototype.rollOut = function (pcb) {
            var partition = pcb.location;
            //free up the partition
            switch (partition) {
                case 0:
                    _MemoryManager.partitionOneFree = true;
                    break;
                case 1:
                    _MemoryManager.partitionTwoFree = true;
                    break;
                case 2:
                    _MemoryManager.partitionThreeFree = true;
                    break;
            }
            //the proccess now needs to swap
            pcb.needToSwap = true;
            if (this.findInDirectory(["~" + pcb.pid.toString()]) == -1) {
                //create a new file if it doesnt exist in directory already
                this.createFile(["~" + pcb.pid]);
                //then set the tsb of the proceess to the newly created file
                pcb.tsb = this.findInDirectory(["~" + pcb.pid.toString()]);
            }
            else {
                //otherwise just set the tsb of the proceess to the file
                pcb.tsb = this.findInDirectory(["~" + pcb.pid.toString()]);
            }
            var stuffToRollOut = new Array();
            for (var i = pcb.base; i < _MemoryManager.getLimit(pcb.location); i++) {
                //the program
                stuffToRollOut.push(_Memory.mem[i]);
            }
            //trims extra data off the end that caused everything to heck up
            for (var j = stuffToRollOut.length - 1; j > 0; j--) {
                if ((stuffToRollOut[j] == "00" && stuffToRollOut[j - 1] == "00")
                    || (stuffToRollOut[j] == "00" && stuffToRollOut[j - 1] == "")
                    || (stuffToRollOut[j] == "" && stuffToRollOut[j - 1] == "00")) {
                    stuffToRollOut.splice(j, 1);
                }
                else {
                    break;
                }
            }
            var temp = "";
            for (var k = 0; k < stuffToRollOut.length; k++) {
                //create a string from the array, joined with ","
                temp += stuffToRollOut[k] + ",";
            }
            //clear contents of file
            this.clearFile("~" + pcb.pid.toString(), pcb.tsb);
            //write new contents
            this.writeUserInputToDisk("~" + pcb.pid.toString(), stuffToRollOut);
            pcb.location = 4;
        };
        return FSDeviceDriver;
    }(TSOS.DeviceDriver));
    TSOS.FSDeviceDriver = FSDeviceDriver;
})(TSOS || (TSOS = {}));
