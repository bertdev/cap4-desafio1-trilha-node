import { app } from "../../../../app";
import request from 'supertest';
import { Connection } from "typeorm";
import createConnection from '../../../../database/index';
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

let connection: Connection;

describe("Show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()

    const id = uuidV4();
    const password = await hash("userpassword", 8);

    await connection.query(`INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${id}', 'user name', 'useremail@test.com', '${password}', 'now()', 'now()');`);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show a user profile", async () => {
    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: "useremail@test.com",
      password: "userpassword"
    });

    const { token } = userAuthenticated.body;

    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('useremail@test.com');
  });

});
