import { Router } from "express";
import { CollaboratorsController } from "./collaborators.controller";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new CollaboratorsController();

// #swagger.tags = ['Collaborators']
// #swagger.summary = 'Add a new collaborator for the authenticated user'
// #swagger.security = [{ "bearerAuth": [] }]
// #swagger.requestBody = {
//   required: true,
//   content: {
//     'application/json': {
//       schema: { $ref: '#/components/schemas/Collaborator' }
//     }
//   }
// }
// #swagger.responses[201] = {
//   description: 'Collaborator added successfully',
//   content: {
//     'application/json': {
//       schema: { $ref: '#/components/schemas/Collaborator' }
//     }
//   }
// }
// #swagger.responses[400] = {
//   description: 'Bad Request - Invalid input data'
// }
// #swagger.responses[401] = {
//   description: 'Unauthorized - Invalid or expired token'
// }
// #swagger.responses[500] = {
//   description: 'Internal Server Error - Failed to add collaborator'
// }

router.post("/", authenticate, (req, res) => controller.addCollaborator(req as AuthRequest, res));
// #swagger.tags = ['Collaborators']
// #swagger.summary = 'Get all collaborators for the authenticated user'
// #swagger.security = [{ "bearerAuth": [] }]
// #swagger.responses[200] = {
//   description: 'List of collaborators retrieved successfully',
//   content: {
//     'application/json': {
//       schema: {
//         type: 'array',
//         items: { $ref: '#/components/schemas/Collaborator' }
//       }
//     }
//   }
// }
// #swagger.responses[401] = {
//   description: 'Unauthorized - Invalid or expired token'
// }
// #swagger.responses[500] = {
//   description: 'Internal Server Error - Failed to retrieve collaborators'
// }
router.get("/", authenticate, (req, res) => controller.getCollaborators(req as AuthRequest, res));

export default router;
