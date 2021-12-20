import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from './CreateTransferUseCase'

class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id: receiverUserId } = request.params;
    const { id: senderUserId } = request.user;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    await createTransferUseCase.execute({
      amount,
      description,
      receiverUserId,
      senderUserId
    });

    return response.send();
  }
}

export { CreateTransferController }
