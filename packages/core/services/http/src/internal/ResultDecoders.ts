import { Decoder } from "mongodb-stitch-core-sdk";
import HttpCookie from "../HttpCookie";
import HttpResponse from "../HttpResponse";

enum Fields {
  Status = "status",
  StatusCode = "statusCode",
  ContentLength = "contentLength",
  Headers = "headers",
  Cookies = "cookies",
  Body = "body",

  CookieValue = "value",
  CookiePath = "path",
  CookieDomain = "domain",
  CookieExpires = "expires",
  CookieMaxAge = "maxAge",
  CookieSecure = "secure",
  CookieHttpOnly = "httpOnly"
}

class HttpResponseDecoder implements Decoder<HttpResponse> {
  public decode(document: object): HttpResponse {
    const status = document[Fields.Status];
    const statusCode = document[Fields.StatusCode];
    const contentLength = document[Fields.ContentLength];

    let headers;
    if (document[Fields.Headers]) {
      headers = {};
      const headersDoc = document[Fields.Headers];
      Object.keys(headersDoc).forEach(headerKey => {
        const headerValue = headersDoc[headerKey];
        const valuesArr = headerValue;
        const values = new Array(valuesArr.length);
        for (const value of valuesArr) {
          values.push(value);
        }
        headers[headerKey] = values;
      });
    } else {
      headers = null;
    }

    let cookies;
    if (document[Fields.Cookies]) {
      cookies = {};
      const cookiesDoc = document[Fields.Cookies];
      for (const [headerKey, headerValue] of cookiesDoc) {
        const name = headerKey;
        const cookieValues = headerValue;
        const value = cookieValues[Fields.CookieValue];

        let path;
        if (cookieValues[Fields.CookiePath]) {
          path = cookieValues[Fields.CookiePath];
        } else {
          path = null;
        }
        let domain;
        if (cookieValues[Fields.CookieDomain]) {
          domain = cookieValues[Fields.CookieDomain];
        } else {
          domain = null;
        }
        let expires;
        if (cookieValues[Fields.CookieExpires]) {
          expires = cookieValues[Fields.CookieExpires];
        } else {
          expires = null;
        }
        let maxAge;
        if (cookieValues[Fields.CookieMaxAge]) {
          maxAge = cookieValues[Fields.CookieMaxAge];
        } else {
          maxAge = null;
        }
        let secure;
        if (cookieValues[Fields.CookieSecure]) {
          secure = cookieValues[Fields.CookieSecure];
        } else {
          secure = null;
        }
        let httpOnly;
        if (cookieValues[Fields.CookieHttpOnly]) {
          httpOnly = cookieValues[Fields.CookieHttpOnly];
        } else {
          httpOnly = null;
        }

        cookies.put(
          headerKey,
          new HttpCookie(
            name,
            value,
            path,
            domain,
            expires,
            maxAge,
            secure,
            httpOnly
          )
        );
      }
    } else {
      cookies = null;
    }

    let body;
    if (document[Fields.Body]) {
      body = document[Fields.Body];
    } else {
      body = "";
    }

    return new HttpResponse(
      status,
      statusCode,
      contentLength,
      headers,
      cookies,
      body
    );
  }
}

export default class ResultDecoders {
  public static readonly HttpResponseDecoder: Decoder<
    HttpResponse
  > = new HttpResponseDecoder();
}
