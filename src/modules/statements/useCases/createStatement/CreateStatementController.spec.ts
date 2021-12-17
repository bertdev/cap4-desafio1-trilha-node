import { app } from "../../../../app";
import request from 'supertest';
import { Connection } from "typeorm";
import createConnection from '../../../../database/index';
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

let connection: Connection;

describe("Create Statement", () => {
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

  it("Should be able to create a deposit statement", async () => {
    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: "useremail@test.com",
      password: "userpassword"
    });

    const { token } = userAuthenticated.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 900,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(900);
  });

  it("Should be able to create a withdraw statement", async () => {
    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: "useremail@test.com",
      password: "userpassword"
    });

    const { token } = userAuthenticated.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 400,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(400);
  });

  it("Should be able to create a withdraw statement without funds", async () => {
    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: "useremail@test.com",
      password: "userpassword"
    });

    const { token } = userAuthenticated.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 900,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

});
