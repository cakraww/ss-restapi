#SS Rest API

[![Build Status](https://codeship.com/projects/2880c640-0250-0134-acd6-5a840fcbac76/status.png?branch=master)](https://codeship.com/projects/2880c640-0250-0134-acd6-5a840fcbac76/status.png?branch=master)

Product and Category management with hierarchical tree data for Category. Can filter based on product size, color and price range.

##Model
###Product
- name
- price
- category: Category
- sizes: [Size]
- colors: [Color]

###ProductSize
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
