import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { hash } from "bcryptjs";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("Should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User Name",
      email: "useremail@test.com",
      password: await hash("userpasswordtest", 8)
    });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toHaveProperty("id");
    expect(userProfile).toEqual(user);
  });

  it("Should not be able to show user profile if user not exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("inexistentUserId");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});
