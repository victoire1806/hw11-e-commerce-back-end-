const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: "tag_products" }],
    });

    if (!tagData) {
      res.status(404).json({ message: `No tags found` });
    }

    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one tag by its `id` with associated products
router.get("/:id", async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: "tag_products" }],
    });

    if (!tagData) {
      res.status(404).json({ message: `No tag found for this id` });
    }

    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create a new tag
router.post("/", async (req, res) => {
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Update a tag's by its `id`
router.put("/:id", async (req, res) => {
  try {
    const tagData = await Tag.update(req.body, {
      where: { id: req.params.id },
    });

    if (!tagData[0]) {
      res.status(404).json({ message: `No tag found for this id` });
      return;
    }

    res.status(200).json(tagData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Delete on tag by its `id`
router.delete("/:id", async (req, res) => {
  try {
    const tagData = await Tag.destroy({ where: { id: req.params.id } });

    if (!tagData) {
      res.status(404).json(`No tag found for this id`);
      return;
    }

    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json(error);
  }
});