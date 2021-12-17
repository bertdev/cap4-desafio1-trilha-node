import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "./../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to get the statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Name",
      email: "useremail@test.com",
      password: await hash("userpasswordtest", 8)
    });

    const statement = await inMemoryStatementsRepository.create({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
    expect(response).toEqual(statement);
  });

  it("Should not be able to get the statement operation to an inexistent user", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "User Name",
        email: "useremail@test.com",
        password: await hash("userpasswordtest", 8)
      });

      const statement = await inMemoryStatementsRepository.create({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      });

      const response = await getStatementOperationUseCase.execute({
        statement_id: statement.id as string,
        user_id: "inexistent_user_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get an inexistent statement operation", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "User Name",
        email: "useremail@test.com",
        password: await hash("userpasswordtest", 8)
      });

      const statement = await inMemoryStatementsRepository.create({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      });

      const response = await getStatementOperationUseCase.execute({
        statement_id: "inexistent_statement_id",
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});

