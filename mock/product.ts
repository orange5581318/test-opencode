import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

const categories = [
  { id: 1, name: '手机数码', productCount: 42, createdAt: '2025-01-10 09:00:00', sort: 1 },
  { id: 2, name: '服装鞋帽', productCount: 88, createdAt: '2025-01-11 10:30:00', sort: 2 },
  { id: 3, name: '家居生活', productCount: 65, createdAt: '2025-01-12 14:00:00', sort: 3 },
  { id: 4, name: '食品饮料', productCount: 120, createdAt: '2025-01-13 08:20:00', sort: 4 },
  { id: 5, name: '运动户外', productCount: 37, createdAt: '2025-01-14 11:00:00', sort: 5 },
  { id: 6, name: '图书文具', productCount: 29, createdAt: '2025-01-15 16:45:00', sort: 6 },
]

const productNames: Record<number, string[]> = {
  1: ['iPhone 15 Pro', '小米14 Ultra', '华为Mate60', 'OPPO Find X7', '三星Galaxy S24', '一加12', 'vivo X100', 'realme GT5', '荣耀Magic6', '索尼Xperia 1 VI'],
  2: ['耐克Air Max 270', '阿迪达斯三叶草', '李宁韦德之道', '安踏氮科技跑鞋', '优衣库羽绒服', "Levi's 501牛仔裤", '波司登羽绒服', '北面冲锋衣', '始祖鸟软壳', '迪卡侬运动T恤'],
  3: ['戴森V15吸尘器', '小米扫地机器人', '九阳破壁机', '美的空气炸锅', '苏泊尔电饭煲', '飞利浦电动牙刷', '松下剃须刀', '博朗电吹风', '宜家KALLAX书架', '乐扣乐扣保鲜盒'],
  4: ['雀巢咖啡礼盒', '三只松鼠坚果大礼包', '良品铺子零食礼盒', '农夫山泉矿泉水', '元气森林气泡水', '伊利纯牛奶', '蒙牛特仑苏', '统一老坛酸菜面', '康师傅红烧牛肉面', '百草味肉脯'],
  5: ['迪卡侬瑜伽垫', '李宁羽毛球拍', '威尔胜网球拍', '迪卡侬登山包', '探路者帐篷', '骆驼户外鞋', '凯乐石冲锋衣', '迪卡侬游泳镜', '美津浓跑步鞋', '安踏篮球鞋'],
  6: ['曹文轩文集', '三体全集', '活着', '百年孤独', '小王子精装版', '晨光中性笔套装', '得力订书机', '广博A4打印纸', '施耐德钢笔', '樱花水彩笔'],
}

const imagePool = [
  'https://picsum.photos/seed/p1/80/80',
  'https://picsum.photos/seed/p2/80/80',
  'https://picsum.photos/seed/p3/80/80',
  'https://picsum.photos/seed/p4/80/80',
  'https://picsum.photos/seed/p5/80/80',
  'https://picsum.photos/seed/p6/80/80',
  'https://picsum.photos/seed/p7/80/80',
  'https://picsum.photos/seed/p8/80/80',
  'https://picsum.photos/seed/p9/80/80',
  'https://picsum.photos/seed/p10/80/80',
]

let productIdCounter = 100

function generateProducts() {
  const list: any[] = []
  categories.forEach((cat) => {
    const names = productNames[cat.id] || []
    names.forEach((name, idx) => {
      productIdCounter++
      list.push({
        id: productIdCounter,
        name,
        categoryId: cat.id,
        categoryName: cat.name,
        price: parseFloat(Mock.mock('@float(9.9, 9999, 1, 2)')),
        stock: Mock.mock('@integer(0, 500)'),
        status: idx % 5 === 0 ? 0 : 1,
        image: imagePool[idx % imagePool.length],
        description: Mock.mock('@cparagraph(1, 2)'),
        createdAt: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'),
      })
    })
  })
  return list
}

const allProducts = generateProducts()

export default [
  {
    url: '/api/product/categories',
    method: 'get',
    response: () => ({ code: 200, data: categories, message: 'ok' }),
  },
  {
    url: '/api/product/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const page = parseInt(query.page || '1')
      const pageSize = parseInt(query.pageSize || '10')
      const keyword = (query.keyword || '').trim().toLowerCase()
      const categoryId = query.categoryId ? parseInt(query.categoryId) : undefined
      const status = query.status !== undefined && query.status !== '' ? parseInt(query.status) : undefined

      let filtered = allProducts.filter((p) => {
        if (keyword && !p.name.toLowerCase().includes(keyword)) return false
        if (categoryId !== undefined && p.categoryId !== categoryId) return false
        if (status !== undefined && p.status !== status) return false
        return true
      })

      const total = filtered.length
      const list = filtered.slice((page - 1) * pageSize, page * pageSize)
      return { code: 200, data: { list, total }, message: 'ok' }
    },
  },
  {
    url: '/api/product/add',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const cat = categories.find((c) => c.id === body.categoryId)
      const newProduct = {
        id: ++productIdCounter,
        ...body,
        categoryName: cat?.name || '',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      }
      allProducts.unshift(newProduct)
      return { code: 200, data: newProduct, message: '新增成功' }
    },
  },
  {
    url: '/api/product/update',
    method: 'put',
    response: ({ body }: { body: any }) => {
      const idx = allProducts.findIndex((p) => p.id === body.id)
      if (idx !== -1) {
        const cat = categories.find((c) => c.id === body.categoryId)
        allProducts[idx] = { ...allProducts[idx], ...body, categoryName: cat?.name || allProducts[idx].categoryName }
      }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/product/delete',
    method: 'delete',
    response: ({ query }: { query: Record<string, string> }) => {
      const id = parseInt(query.id)
      const idx = allProducts.findIndex((p) => p.id === id)
      if (idx !== -1) allProducts.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },
  {
    url: '/api/product/toggleStatus',
    method: 'put',
    response: ({ body }: { body: { id: number; status: number } }) => {
      const product = allProducts.find((p) => p.id === body.id)
      if (product) product.status = body.status
      return { code: 200, data: null, message: '状态更新成功' }
    },
  },
  {
    url: '/api/product/category/add',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newCat = {
        id: categories.length + 10,
        name: body.name,
        productCount: 0,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        sort: body.sort ?? categories.length + 1,
      }
      categories.push(newCat)
      return { code: 200, data: newCat, message: '新增成功' }
    },
  },
  {
    url: '/api/product/category/update',
    method: 'put',
    response: ({ body }: { body: any }) => {
      const cat = categories.find((c) => c.id === body.id)
      if (cat) { cat.name = body.name; cat.sort = body.sort }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/product/category/delete',
    method: 'delete',
    response: ({ query }: { query: Record<string, string> }) => {
      const id = parseInt(query.id)
      const idx = categories.findIndex((c) => c.id === id)
      if (idx !== -1) categories.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },
] as MockMethod[]
