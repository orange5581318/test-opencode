import request from './request'

export interface Category {
  id: number
  name: string
  productCount: number
  createdAt: string
  sort: number
}

export interface Product {
  id: number
  name: string
  categoryId: number
  categoryName: string
  price: number
  stock: number
  status: 0 | 1
  image: string
  description: string
  createdAt: string
}

export interface ProductListParams {
  page: number
  pageSize: number
  keyword?: string
  categoryId?: number
  status?: number
}

export interface ProductListResult {
  list: Product[]
  total: number
}

export interface ProductForm {
  name: string
  categoryId: number | ''
  price: number | ''
  stock: number | ''
  status: 0 | 1
  image: string
  description: string
}

export interface CategoryForm {
  name: string
  sort: number | ''
}

/** 获取商品分类列表 */
export function getCategories(): Promise<Category[]> {
  return request.get('/product/categories')
}

/** 新增商品分类 */
export function addCategory(data: CategoryForm): Promise<Category> {
  return request.post('/product/category/add', data)
}

/** 更新商品分类 */
export function updateCategory(data: CategoryForm & { id: number }): Promise<null> {
  return request.put('/product/category/update', data)
}

/** 删除商品分类 */
export function deleteCategory(id: number): Promise<null> {
  return request.delete('/product/category/delete', { params: { id } })
}

/** 获取商品列表（分页） */
export function getProductList(params: ProductListParams): Promise<ProductListResult> {
  return request.get('/product/list', { params })
}

/** 新增商品 */
export function addProduct(data: ProductForm): Promise<Product> {
  return request.post('/product/add', data)
}

/** 更新商品信息 */
export function updateProduct(data: ProductForm & { id: number }): Promise<null> {
  return request.put('/product/update', data)
}

/** 删除商品 */
export function deleteProduct(id: number): Promise<null> {
  return request.delete('/product/delete', { params: { id } })
}

/** 切换商品上下架状态 */
export function toggleProductStatus(id: number, status: 0 | 1): Promise<null> {
  return request.put('/product/toggleStatus', { id, status })
}
