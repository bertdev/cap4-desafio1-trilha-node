import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { OperationType } from "../../entities/Statement"

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  })

  it("Should be able to get a balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Name",
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "test"
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 600,
      description: "test"
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id as string });
    expect(balance.statement).toHaveLength(2);
    expect(balance.balance).toBe(400);
  })
})
