import expressRouter from "express";
import userRouter from "./userRoutes.js";
import productRouter from "./productRoutes.js";
import billingRouter from "./billingRoutes.js";

const router = expressRouter();

router.use("/user", userRouter);
router.use("/product", productRouter);
router.use("/billing", billingRouter);

export default router;
