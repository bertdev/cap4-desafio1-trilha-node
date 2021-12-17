import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "useremail@test.com",
      password: "userpasswordtest"
    });

    expect(user).toHaveProperty("id");
    expect(user.email).toBe("useremail@test.com");
  });

  it("Should not be able to create a new user with an email that is already in use", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name",
        email: "useremail@test.com",
        password: "userpasswordtest"
      });

      await createUserUseCase.execute({
        name: "Other User Name",
        email: "useremail@test.com",
        password: "otheruserpasswordtest"
      })
    }).rejects.toBeInstanceOf(CreateUserError);
  })

})
