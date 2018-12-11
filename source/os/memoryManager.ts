///<reference path="../host/memory.ts" />

/* ------------
     memoryManager.ts

     Requires Memory.ts.

     Class for managing memory
------------ */

module TSOS {
    export class memoryManager {
        constructor(public memory: String[],
                    public partitionOneFree: boolean,
                    public partitionTwoFree: boolean,
                    public partitionThreeFree: boolean,
                    public latestPartition: number) {
            this.memory = _Memory.mem;
            this.partitionOneFree = true;
            this.partitionTwoFree = true;
            this.partitionThreeFree = true;
        }

        //load the program into memory
        public loadProgram(userInput): void {
            var partitionBase;
            if (this.partitionOneFree) {
                partitionBase = 0;
                //clears mem partition
                this.clearMemPartition(0);
                this.partitionOneFree = false;
                this.latestPartition = 0;
            }
            else if (this.partitionTwoFree) {
                partitionBase = 256;
                //clears mem partition
                this.clearMemPartition(1);
                this.partitionTwoFree = false;
                this.latestPartition = 1;
            }
            else if (this.partitionThreeFree) {
                partitionBase = 512;
                //clears mem partition
                this.clearMemPartition(2);
                this.partitionThreeFree = false;
                this.latestPartition = 2;
            }
            //sets each loacation in memory to the user input starting at 0000
            for (var i = 0; i < userInput.length; i++) {
                this.memory[partitionBase] = userInput[i];
                //update memory table
                document.getElementById(partitionBase.toString()).innerHTML = this.memory[i];
                partitionBase++;
            }

            _Memory.mem = this.memory;
        }

        //clears memory by setting everything to "00"
        public clearMem(): void {
            for (var i = 0; i <= 767; i++) {
                this.memory[i] = "00";
                document.getElementById(i.toString()).innerHTML = "00";
            }
            this.partitionOneFree = true;
            this.partitionTwoFree = true;
            this.partitionThreeFree = true;
            _Memory.mem = this.memory;
        }

        public clearMemPartition(part): void {
            var base = 0;
            switch (part) {
                case 0:
                    base = 0;
                    this.partitionOneFree = true;
                    break;
                case 1:
                    base = 256;
                    this.partitionTwoFree = true;
                    break;
                case 2:
                    base = 512;
                    this.partitionThreeFree = true;
                    break;
            }

            for (base; base <= this.getLimit(part); base++) {
                this.memory[base] = "00";
                document.getElementById(base.toString()).innerHTML = "00";
            }
            _Memory.mem = this.memory;
        }

        public getLimit(part): number {
            switch (part) {
                case 0:
                    return 255;
                    break;
                case 1:
                    return 511;
                    break;
                case 2:
                    return 767;
                    break;
            }
        }
    }
}
