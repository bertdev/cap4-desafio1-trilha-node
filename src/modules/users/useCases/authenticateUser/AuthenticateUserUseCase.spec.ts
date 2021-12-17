import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import { hash } from "bcryptjs"


let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to authenticate a user passing an email and password valid", async () => {
    await inMemoryUsersRepository.create({
      name: "User Name",
      email: "useremail@test.com",
      password: await hash("userpasswordtest", 8)
    });

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    expect(userAuthenticated).toHaveProperty("token");
    expect(userAuthenticated.user.email).toBe("useremail@test.com");
  });

  it("Should not be able to authenticate an inexistent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "inexistentuser@test.com",
        password: await hash("anypassword", 8)
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user passing a wrong password", () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        name: "User Name",
        email: "useremail@test.com",
        password: await hash("userpasswordtest", 8)
      });

      await authenticateUserUseCase.execute({
        email: "useremail@test.com",
        password: "wrong password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user passing a wrong email", () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        name: "User Name",
        email: "useremail@test.com",
        password: await hash("userpasswordtest", 8)
      });

      await authenticateUserUseCase.execute({
        email: "wronguseremail@test.com",
        password: "userpasswordtest"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
