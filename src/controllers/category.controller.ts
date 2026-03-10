import { Request, Response } from "express";
import {
  getFullCategoryTree,
  getCategoryByPath,
  getCategoryById,
  getChildren,
  getBreadcrumb,
  getDescendants,
  getCategoryProperties,
  refreshCategoryCache,
  buildingMegaMenuService,
} from "../services/category.service";

const getFullCategoryTreeController = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = getFullCategoryTree();

    return res.status(200).send({
      message: "Full category tree fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error(
      "Get full category tree error:",
      error
    );

    return res.status(500).send({
      error: "Unable to fetch category tree",
    });
  }
};



const getCategoryByPathController = async (
  req: Request,
  res: Response
) => {
  try {
    const path = req.params[0];

    const category =
      getCategoryByPath(path);

    if (!category) {
      return res.status(404).send({
        error: "Category not found",
      });
    }

    return res.status(200).send({
      message:
        "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error(
      "Get category by path error:",
      error
    );

    return res.status(500).send({
      error: "Unable to fetch category",
    });
  }
};

const getCategoryByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const category = getCategoryById(id);

    if (!category) {
      return res.status(404).send({
        error: "Category not found",
      });
    }

    return res.status(200).send({
      message:
        "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error(
      "Get category by id error:",
      error
    );

    return res.status(500).send({
      error: "Unable to fetch category",
    });
  }
};
const getCategoryChildrenController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const children = getChildren(id);

    return res.status(200).send({
      message:
        "Category children fetched successfully",
      data: children,
    });
  } catch (error) {
    console.error(
      "Get category children error:",
      error
    );

    return res.status(500).send({
      error:
        "Unable to fetch category children",
    });
  }
};

const getCategoryBreadcrumbController =
  async (req: Request, res: Response) => {
    try {
      const { path } = req.params;

      const breadcrumb =
        getBreadcrumb(path);

      return res.status(200).send({
        message:
          "Category breadcrumb fetched successfully",
        data: breadcrumb,
      });
    } catch (error) {
      console.error(
        "Get category breadcrumb error:",
        error
      );

      return res.status(500).send({
        error: "Unable to fetch breadcrumb",
      });
    }
  };

  const getCategoryDescendantsController =
  async (req: Request, res: Response) => {
    try {
      const { path } = req.params;

      const descendants =
        getDescendants(path);

      return res.status(200).send({
        message:
          "Category descendants fetched successfully",
        data: descendants,
      });
    } catch (error) {
      console.error(
        "Get category descendants error:",
        error
      );

      return res.status(500).send({
        error:
          "Unable to fetch category descendants",
      });
    }
  };

  const getCategoryPropertiesController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const properties =
        getCategoryProperties(id);

      return res.status(200).send({
        message:
          "Category properties fetched successfully",
        data: properties,
      });
    } catch (error) {
      console.error(
        "Get category properties error:",
        error
      );

      return res.status(500).send({
        error:
          "Unable to fetch category properties",
      });
    }
  };

  const refreshCategoryCacheController =
  async (req: Request, res: Response) => {
    try {
      await refreshCategoryCache();

      return res.status(200).send({
        message:
          "Category cache refreshed successfully",
      });
    } catch (error) {
      console.error(
        "Refresh category cache error:",
        error
      );

      return res.status(500).send({
        error:
          "Unable to refresh category cache",
      });
    }
  };
  

const getMegaMenuController = async (
  req: Request,
  res: Response
) => {
  try {
    const menu = await buildingMegaMenuService();

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Mega menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to build mega menu",
    });
  }
};
  export {
  getFullCategoryTreeController,
  getCategoryByPathController,
  getCategoryByIdController,
  getCategoryChildrenController,
  getCategoryBreadcrumbController,
  getCategoryDescendantsController,
  getCategoryPropertiesController,
  getMegaMenuController,
  refreshCategoryCacheController,
};