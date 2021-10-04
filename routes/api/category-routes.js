const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });

    if (!categoryData.length) {
      res.status(404).json({ message: "No categories found" });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one category by its `id` with associated products
router.get("/:id", async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!categoryData) {
      res.status(400).json({ message: `No category found for this id` });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create a new category
router.post("/", async (req, res) => {
  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Update a category by its `id`
router.put("/:id", async (req, res) => {
  try {
    const categoryData = await Category.update(req.body, {
      where: { id: req.params.id },
    });

    if (!categoryData[0]) {
      res.status(404).json({ message: `No category found for this id` });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Delete a category by its `id`
router.delete("/:id", async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: { id: req.params.id },
    });

    if (!categoryData) {
      res.status(404).json({ message: `No category found for this id` });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
