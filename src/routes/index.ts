import { Application } from "express";

import userRoutes from "./user.routes";
import homeRoutes from "./home.routes";
import shopRoutes from "./shop.routes";
import brandRoutes from "./brand.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
// import orderRoutes from "./order.routes";

const initRoutes = (app: Application): void => {
  app.use("/", userRoutes);
  app.use("/", homeRoutes);
  app.use("/", shopRoutes);
  app.use("/", brandRoutes);
  app.use("/", categoryRoutes);

  app.use("/", productRoutes);
  // app.use("/", orderRoutes);
};

export default initRoutes;
