import { Router } from "express";
import healthRoutes from "./health.routes";
import propertyRoutes from "./property.routes";
import tenantRoutes from "./tenant.routes";
import contractRoutes from "./contract.routes";
import paymentRoutes from "./payment.routes";
import reportRoutes from "./report.routes";

/**
 * Root API router
 */
const router = Router();

router.use("/health", healthRoutes);
router.use("/properties", propertyRoutes);
router.use("/tenants", tenantRoutes);
router.use("/contracts", contractRoutes);
router.use("/payments", paymentRoutes);
router.use("/reports", reportRoutes);

export default router;
