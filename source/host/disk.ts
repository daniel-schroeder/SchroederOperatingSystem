///<reference path="../globals.ts" />

/* ------------
     Disk.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class Disk {

        constructor(public numTracks: number = 4,
                    public numSectors: number = 8,
                    public numblocks: number = 8,
                    public blockSize: number = 64) {
            this.formatDisk();
        }

        public writeToDisk(tsb, data): void {
            //fill in rest of block will null character 0
            while (data.length < this.blockSize * 2) {
                data += "00";
            }
            sessionStorage.setItem((tsb[0] + ":" + tsb[1] + ":" + tsb[2]), data);
            _Kernel.updateDiskDisplay((tsb[0] + ":" + tsb[1] + ":" + tsb[2]), data);
        }

        public formatDisk(): void {
            var tsb;
            for (var track = 0; track < this.numTracks; track++) {
                for (var sector = 0; sector < this.numSectors; sector++) {
                    for (var block = 0; block < this.numblocks; block++) {
                        tsb = [track, sector, block];
                        this.writeToDisk(tsb, "");
                    }
                }
            }
        }

        public readFromDisk(tsb): String {
            var data = sessionStorage.getItem(tsb[0] + ':' + tsb[1] + ':' + tsb[2]);
            return data;
        }

        public readStringFromDisk(tsb): String {
            var data = sessionStorage.getItem(tsb[0] + ':' + tsb[1] + ':' + tsb[2]);
            var stringData = ""
            for (var i = 8; i < data.length; i+=2) {
                if ((data[i] + data[i+1]) == "00") {
                    i = data.length;
                } else {
                    stringData += String.fromCharCode(parseInt((data[i] + data[i+1]), 16));
                }
            }
            return stringData;
        }
    }
}
