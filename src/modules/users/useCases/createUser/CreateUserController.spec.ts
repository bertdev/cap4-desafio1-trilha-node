import request from 'supertest'
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from "../../../../database/index"

let connection: Connection;

describe("Create User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a new user with an email that is already in use", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Other Name User Test",
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    expect(response.status).toBe(400);
  });
});
