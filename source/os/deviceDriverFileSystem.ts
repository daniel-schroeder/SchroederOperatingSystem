///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class FSDeviceDriver extends DeviceDriver {

        constructor() {
            super();
            this.driverEntry = this.krnFSDriverEntry;
        }

        public krnFSDriverEntry(): void {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        }

        public getAllFiles(): any {
            var filenames = new Array();
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    var name = _Disk.readStringFromDisk([0, sector, block]);
                    if (name.length != 0) {
                        filenames.push(name);
                    }
                }
            }
            return filenames;
        }

        public findOpenBlock(): any {
            var tsb;
            for (var track = 1; track < _Disk.numTracks; track++) {
                for (var sector = 0; sector < _Disk.numSectors; sector++) {
                    for (var block = 0; block < _Disk.numblocks; block++) {
                        tsb = [track, sector, block];
                        var data = _Disk.readFromDisk(tsb);
                        if (data[0] + data[1] == "00") {
                            return tsb;
                        }
                    }
                }
            }
        }

        public findSpotInDirectory(filename): any {
            var tsb;
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j+1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j+1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                        if (fileExists) {
                            return -1;
                        }
                    } else if (data[0] + data[1] == "00") {
                        return tsb;
                    }
                }
            }
        }

        public createFile(filename): number {
            var tsbForDirectory = this.findSpotInDirectory(filename[0]);
            if (tsbForDirectory == -1) {
                return 1;
            }
            var tsbForData = this.findOpenBlock();
            if (tsbForData == null) {
                return 2;
            }
            var name = "010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2];
            for (var i = 0; i < filename[0].length; i++) {
                name += filename[0].charCodeAt(i).toString(16);
            }
            if (name.length > (_Disk.blockSize * 2)) {
                name = name.substring(0, (_Disk.blockSize * 2));
                _Disk.writeToDisk(tsbForDirectory, name);
                _Disk.writeToDisk(tsbForData, ("010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2]));

                return 4;
            }
            _Disk.writeToDisk(tsbForDirectory, name);
            _Disk.writeToDisk(tsbForData, ("010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2]));

            return 3;
        }

        public readFromDisk(filename): any {
            var tsb;
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j+1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j+1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3,4), data.substring(5,6), data.substring(7,8)];
                            return _Disk.readStringFromDisk(tsb);
                        }
                    }
                }
            }
        }

        public deleteFile(filename): void {
            var tsb;
            this.clearFile(filename);
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j+1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j+1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                    }
                    if (fileExists) {
                        _Disk.writeToDisk(tsb, "");
                    }
                }
            }
        }

        public clearFile(filename, tsb = null): void {
            if (tsb != null) {
                var data = sessionStorage.getItem(tsb);
                if (data == null) {
                    return;
                } else {
                    var nextData;
                    do {
                        nextData = sessionStorage.getItem(data[3] + ':' + data[5] + ':' + data[7]);
                        _Disk.writeToDisk(data[3] + ':' + data[5] + ':' + data[7], "");
                        data = nextData;
                    } while ((data[3] != nextData[3]) || (data[5] != nextData[5]) || (data[7] != nextData[7]))
                    _Disk.writeToDisk(data[3] + ':' + data[5] + ':' + data[7], "");
                }
            } else {
                var tsb;
                for (var sector = 0; sector < _Disk.numSectors; sector++) {
                    for (var block = 0; block < _Disk.numblocks; block++) {
                        //dont need to check 0:0:0
                        if (sector == 0 && block == 0) {
                            block++;
                        }
                        tsb = [0, sector, block];
                        var data = _Disk.readFromDisk(tsb);
                        var j = 8;
                        var i = 0;
                        var fileExists = false;
                        if (data[0] + data[1] == "01") {
                            while (i < filename.length) {
                                if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j+1], 16))) {
                                    j += 2;
                                }
                                else {
                                    break;
                                    fileExists = false;
                                }
                                i++;
                            }
                            if (data[j] + data[j+1] == "00" && filename[i] == null) {
                                fileExists = true;
                            }
                        }
                        if (fileExists) {
                            var nextData;
                            do {
                                if (nextData != null) {
                                    data = nextData;
                                }
                                nextData = sessionStorage.getItem(data[3] + ':' + data[5] + ':' + data[7]);

                                _Disk.writeToDisk([data[3], data[5], data[7]], "");
                            } while ((data[3] != nextData[3]) || (data[5] != nextData[5]) || (data[7] != nextData[7]))
                            _Disk.writeToDisk([data[3], data[5], data[7]], "");
                        } else {

                        }
                    }
                }
            }
        }

        public writeToDisk(filename, text): any {
            var tsb;
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j+1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j+1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3,4), data.substring(5,6), data.substring(7,8)];
                            this.clearFile(filename, tsb);
                            var trimmedText = text.substring(1, text.length-1);
                            var counter = 0;
                            if (trimmedText.length > _Disk.blockSize - 4) {
                                var numBlocksNeeded = Math.ceil(trimmedText.length / (_Disk.blockSize - 4));
                                for (var i = 0; i < numBlocksNeeded; i++) {
                                    var nextTSB = this.findOpenBlock();
                                    if ((i + 1) != numBlocksNeeded) {
                                        var temp = "010" + nextTSB[0] + "0" + nextTSB[1] + "0" + nextTSB[2];
                                    } else {
                                        var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                                    }
                                    for (var j = 0; j < _Disk.blockSize-4; j++) {
                                        if (counter >= trimmedText.length) {
                                            j = _Disk.blockSize;
                                        } else {
                                            temp += trimmedText.charCodeAt(counter).toString(16);
                                            counter++;
                                        }
                                    }
                                    _Disk.writeToDisk(tsb, temp);
                                    tsb = nextTSB;
                                }
                            } else {
                                var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                                for (var i = 0; i < trimmedText.length; i++) {
                                    temp += trimmedText.charCodeAt(i).toString(16);
                                }
                                _Disk.writeToDisk(tsb, temp);
                            }
                        }
                    }
                }
            }
        }
    }
}
