import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to authenticate a user passing an email and password valid", async () => {
    await createUserUseCase.execute({
      name: "User Name",
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    expect(userAuthenticated).toHaveProperty("token");
    expect(userAuthenticated.user.email).toBe("useremail@test.com");
  });


});
