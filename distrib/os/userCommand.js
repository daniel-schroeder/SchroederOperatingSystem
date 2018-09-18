var DSOS;
(function (DSOS) {
    var UserCommand = /** @class */ (function () {
        function UserCommand(command, args) {
            if (command === void 0) { command = ""; }
            if (args === void 0) { args = []; }
            this.command = command;
            this.args = args;
        }
        return UserCommand;
    }());
    DSOS.UserCommand = UserCommand;
})(DSOS || (DSOS = {}));
