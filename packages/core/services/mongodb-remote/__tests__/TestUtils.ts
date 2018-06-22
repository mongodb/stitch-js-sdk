/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  CoreStitchAuth,
  CoreStitchServiceClientImpl,
  StitchServiceRoutes
} from "mongodb-stitch-core-sdk";
import { instance, mock, spy } from "ts-mockito";
import {
  CoreRemoteMongoClient,
  CoreRemoteMongoClientImpl,
  CoreRemoteMongoDatabase
} from "../src";
import CoreRemoteMongoCollection from "../src/internal/CoreRemoteMongoCollection";

export function getClient(): CoreRemoteMongoClient {
  const serviceMock = mock(CoreStitchServiceClientImpl);
  return new CoreRemoteMongoClientImpl(instance(serviceMock));
}

export function getDatabase(name = "dbName1"): CoreRemoteMongoDatabase {
  const service = mock(CoreStitchServiceClientImpl);
  const client = new CoreRemoteMongoClientImpl(service);
  return client.db(name);
}

export function getCollection(
  name = "collName1",
  client?: CoreRemoteMongoClient
): CoreRemoteMongoCollection<object> {
  if (client) {
    return client.db("dbName1").collection("collName1");
  }

  const routes = new StitchServiceRoutes("foo");
  const requestClientMock = mock(CoreStitchAuth);
  const requestClient = instance(requestClientMock);
  const service = spy(
    new CoreStitchServiceClientImpl(requestClient, routes, "")
  );
  client = new CoreRemoteMongoClientImpl(service);
  const db = client.db("dbName1");
  return db.collection(name);
}
