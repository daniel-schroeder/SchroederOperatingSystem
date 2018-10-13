///<reference path="../host/memory.ts" />

/* ------------
     memoryManager.ts

     Requires Memory.ts.

     Class for managing memory
------------ */

module TSOS {
    export class memoryManager {
        constructor(public memory: String[],) {
            this.memory = _Memory.mem;
        }

        public loadProgram(): void {
            this.clearMem();
            var userInput = document.getElementById("taProgramInput").value.split(" ");
            for (var i = 0; i < userInput.length; i++) {
                this.memory[i] = userInput[i];
            }

            for (var i = 0; i < this.memory.length; i++) {
                document.getElementById(i.toString()).innerHTML = this.memory[i];
            }
            _Memory.mem = this.memory;
        }

        public clearMem(): void {
            for (var i = 0; i <= 255; i++) {
                this.memory[i] = "00";
                document.getElementById(i.toString()).innerHTML = "00";
            }
            _Memory.mem = this.memory;
        }

        public getLimit(): number {
            var limit = 255;
            return limit;
        }
    }
}
