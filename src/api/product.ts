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

export function getCategories(): Promise<Category[]> {
  return request.get('/product/categories')
}

export function addCategory(data: CategoryForm): Promise<Category> {
  return request.post('/product/category/add', data)
}

export function updateCategory(data: CategoryForm & { id: number }): Promise<null> {
  return request.put('/product/category/update', data)
}

export function deleteCategory(id: number): Promise<null> {
  return request.delete('/product/category/delete', { params: { id } })
}

export function getProductList(params: ProductListParams): Promise<ProductListResult> {
  return request.get('/product/list', { params })
}

export function addProduct(data: ProductForm): Promise<Product> {
  return request.post('/product/add', data)
}

export function updateProduct(data: ProductForm & { id: number }): Promise<null> {
  return request.put('/product/update', data)
}

export function deleteProduct(id: number): Promise<null> {
  return request.delete('/product/delete', { params: { id } })
}

export function toggleProductStatus(id: number, status: 0 | 1): Promise<null> {
  return request.put('/product/toggleStatus', { id, status })
}
