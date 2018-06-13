import {
  CoreStitchAuth,
  CoreStitchServiceClientImpl,
  StitchServiceRoutes
} from "stitch-core";
import { instance, mock, spy } from "ts-mockito";
import {
  CoreRemoteMongoClient,
  CoreRemoteMongoClientImpl,
  CoreRemoteMongoDatabase
} from "../lib";
import CoreRemoteMongoCollection from "../lib/internal/CoreRemoteMongoCollection";

export function getClient(): CoreRemoteMongoClient {
  const serviceMock = mock(CoreStitchServiceClientImpl);
  return new CoreRemoteMongoClientImpl(instance(serviceMock));
}

export function getDatabase(name: string = "dbName1"): CoreRemoteMongoDatabase {
  const service = mock(CoreStitchServiceClientImpl);
  const client = new CoreRemoteMongoClientImpl(service);
  return client.db(name);
}

export function getCollection(
  name: string = "collName1",
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
