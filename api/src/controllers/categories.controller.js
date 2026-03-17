import ApiError from "../utils/error.js";
import db from "../lib/db/database.js";

export const getCategories = async (req, res) => {
  try {
    const query = `
            SELECT
                c.id,
                c.name,
                c.description,
                c.sort_order,
                c.is_active,
                EXISTS(
                    SELECT 1 FROM products p
                    JOIN product_options po ON p.id = po.product_id
                    WHERE p.category_id = c.id AND po.option_type = 'size' AND po.is_available = true
                ) as has_sizes,
                EXISTS(
                    SELECT 1 FROM products p
                    JOIN product_options po ON p.id = po.product_id
                    WHERE p.category_id = c.id AND po.option_type = 'milk' AND po.is_available = true
                ) as has_milk_options
            FROM categories c
            WHERE c.is_active = true
            ORDER BY c.sort_order ASC
        `;

    const { rows } = await db.query(query);

    res.status(200).json({
      success: true,
      categories: rows,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to fetch categories",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) throw ApiError.badRequest("Category ID is required.");

    const query = `
            SELECT
                c.id,
                c.name,
                c.description,
                c.sort_order,
                c.is_active,
                EXISTS(
                    SELECT 1 FROM products p
                    JOIN product_options po ON p.id = po.product_id
                    WHERE p.category_id = c.id AND po.option_type = 'size' AND po.is_available = true
                ) as has_sizes,
                EXISTS(
                    SELECT 1 FROM products p
                    JOIN product_options po ON p.id = po.product_id
                    WHERE p.category_id = c.id AND po.option_type = 'milk' AND po.is_available = true
                ) as has_milk_options
            FROM categories c
            WHERE c.id = $1 AND c.is_active = true
            LIMIT 1
        `;

    const { rows } = await db.query(query, [id]);
    const category = rows[0];

    if (!category) throw ApiError.notFound("Category not found.");

    res.status(200).json({
      success: true,
      category: category,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to fetch category details",
    });
  }
};
