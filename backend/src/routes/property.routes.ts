import { Router } from "express";
import { propertyController } from "../controllers/property.controller";
import { validateRequest } from "../middleware/validateRequest.middleware";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  listPropertiesSchema,
} from "../validators/property.validator";

const router = Router();

router.get(
  "/",
  validateRequest(listPropertiesSchema),
  propertyController.getAll
);

router.get(
  "/:id",
  validateRequest(getPropertySchema),
  propertyController.getById
);

router.post(
  "/",
  validateRequest(createPropertySchema),
  propertyController.create
);

router.put(
  "/:id",
  validateRequest(updatePropertySchema),
  propertyController.update
);

router.delete(
  "/:id",
  validateRequest(getPropertySchema),
  propertyController.delete
);

export default router;
