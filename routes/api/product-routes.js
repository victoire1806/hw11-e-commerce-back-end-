const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag, as: "product_tags" }, 
      ],
    });

    if (!productData) {
      res.status(404).json({ message: "No products found" });
      return;
    }

    res.status(200).json(productData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one product by its `id` with associated category and tag data
router.get("/:id", async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag, as: "product_tags" }, //getting double?
      ],
    });

    if (!productData) {
      res.status(400).json({ message: `No product found for this id` });
      return;
    }

    res.status(200).json(productData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create a new product
router.post("/", async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    const productData = await Product.create(req.body);

    // if product tags included create product-tag relations and bulk create with ProductTag model
    // else end and return product data
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return { product_id: productData.id, tag_id };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);

      res.status(200).json({ productData, productTagIds });
      return;
    }

    res.status(200).json(productData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Update a product by its `id`
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// Delete a product by its `id`
router.delete("/:id", async (req, res) => {
  try {
    const productData = await Product.destroy({ where: { id: req.params.id } });

    if (!productData) {
      res.status(404).json({ message: `No product found for this id` });
      return;
    }

    res.status(200).json(productData);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
