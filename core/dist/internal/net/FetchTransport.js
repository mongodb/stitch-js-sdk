"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FetchTransport {
    roundTrip(request) {
        return fetch(request.url, {
            body: request.body,
            headers: request.headers,
            method: request.method
        }).then(response => {
            const headers = {};
            response.headers.forEach((key, value) => {
                headers[key] = value;
            });
            return {
                body: response.text,
                headers,
                statusCode: response.status
            };
        });
    }
}
exports.default = FetchTransport;
//# sourceMappingURL=FetchTransport.js.map