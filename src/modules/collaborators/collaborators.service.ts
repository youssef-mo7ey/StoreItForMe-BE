import { Collaborator } from "@prisma/client";
import prisma from "../../config/database";
import { CollaboratorInput } from "../../types/auth.types";

export class CollaboratorsService {
  // --- Collaborator Management Methods ---
  async addCollaborator(
    userId: string,
    collaboratorData: CollaboratorInput
  ): Promise<Collaborator> {
    const collaborator = await prisma.collaborator.create({
      data: {
        userId,
        ...collaboratorData,
      },
    });
    return collaborator;
  }

  async getCollaborators(userId: any) {
    const collaborators = await prisma.collaborator.findMany({
      where: { userId },
    });
    return collaborators;
  }
}
