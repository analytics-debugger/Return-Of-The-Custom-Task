var logRequestsToConsoleTask = (function () {
    'use strict';

    /**
     * Prints the current RequestModel to the console.
     *
     * @param request - The RequestModel object to be logged.
     * @returns The unchanged RequestModel object.
     */
    var logRequestsToConsoleTask = function (request) {
        console.group("%cReturnOfTheCustomTask: New Request (".concat(request.events.length, " Events)"), 'color: purple; font-size: large; font-weight: bold;');
        console.log(request);
        console.groupEnd();
        // Return the RequestModel object as is
        return request;
    };

    return logRequestsToConsoleTask;

})();
