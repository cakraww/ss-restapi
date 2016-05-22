#SS Rest API

Product and Category management with hierarchical tree data for Category. Can filter based on product size, color and price range.

##Model
###Product
- name
- price
- category: Category
- sizes: [Size]
- colors: [Color]

###ProducSize
- size
- product: Product

###ProductColor
- color
- product: Product

###Category
- name
- parent: Category
- children: [Category]

##Endpoints
```
/api
  /products
    GET     /       getProducts(sizes, colors, priceMin, priceMax)
    GET     /:id    getProduct()
    POST    /       createProduct(name, price, sizes, colors, categoryId)
    DELETE  /:id    deleteProduct()
  /categories
    GET     /       getCategories()
    GET     /:id    getCategory()
    POST    /       createCategory(name, parentId)
    DELETE  /:id    deleteCategory()
```
