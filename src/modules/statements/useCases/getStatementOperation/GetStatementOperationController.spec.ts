import { app } from "../../../../app";
import request from 'supertest';
import { Connection } from "typeorm";
import createConnection from '../../../../database/index';
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

let connection: Connection;

describe("Get a Statement", () => {
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

  it("Should be able to get the statement", async () => {
    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: "useremail@test.com",
      password: "userpassword"
    });

    const { token } = userAuthenticated.body;

    const statementDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 900,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 400,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const depositId = statementDeposit.body.id;
    const withdrawId = statementWithdraw.body.id;

    const responseDeposit = await request(app)
      .get(`/api/v1/statements/${depositId}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .get(`/api/v1/statements/${withdrawId}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(200);
    expect(responseDeposit.body.id).toBe(depositId);
    expect(responseWithdraw.status).toBe(200);
    expect(responseWithdraw.body.id).toBe(withdrawId);
  });

  it("should not be able to get the statement from a non-existent id", async () => {
    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: "useremail@test.com",
      password: "userpassword"
    });

    const { token } = userAuthenticated.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

});
