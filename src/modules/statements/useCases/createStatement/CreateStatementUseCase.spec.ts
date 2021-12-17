import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from './../../entities/Statement'
import { CreateStatementError } from './CreateStatementError'
import { hash } from 'bcryptjs'

let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementRepository: InMemoryStatementsRepository;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
  });

  it("Should be able to create a deposit statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Name",
      email: "useremail@test.com",
      password: await hash("userpasswordtest", 8)
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "test"
    });

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toBe(user.id);
    expect(statement.type).toBe("deposit");
  });

  it("Should be able to create a withdraw statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Name",
      email: "useremail@test.com",
      password: await hash("userpasswordtest", 8)
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "test"
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 600,
      description: "test"
    });

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toBe(user.id);
    expect(statement.type).toBe("withdraw");
  });


  it("Should not be able to create any statement with an inexistent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: "non-existent",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a withdraw statement if the user has insufficient funds", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "User Name",
        email: "useremail@test.com",
        password: await hash("userpasswordtest", 8)
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
