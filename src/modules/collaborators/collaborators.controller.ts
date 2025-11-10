import { Request, Response } from "express";
import { CollaboratorsService } from "./collaborators.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

const collaboratorsService = new CollaboratorsService();

export class CollaboratorsController {
  async addCollaborator(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const collaborator = await collaboratorsService.addCollaborator(
        userId,
        req.body
      );

      res.status(201).json(collaborator);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add collaborator" });
    }
  }

  async getCollaborators(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const collaborators = await collaboratorsService.getCollaborators(userId);
      res.status(200).json(collaborators);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve collaborators" });
    }
  }
}
