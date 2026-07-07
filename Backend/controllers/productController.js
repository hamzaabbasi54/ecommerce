import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Generate a URL-friendly slug from a product name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric chars with hyphens
        .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
};

// ==================== ADMIN CONTROLLERS ====================

// POST /api/admin/products
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, discountPrice, stock, categoryId, brandId } = req.body;

        if (!name || !price || !stock || !categoryId || !brandId) {
            return res.status(400).json({ success: false, message: 'Name, price, stock, categoryId, and brandId are required' });
        }

        // Validate that category exists
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Validate that brand exists
        const brand = await prisma.brand.findUnique({ where: { id: brandId } });
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }

        // Generate unique slug
        let slug = generateSlug(name);
        const existingSlug = await prisma.product.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`; // Append timestamp to make it unique
        }

        // Handle multiple image uploads from Multer
        const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`): [];

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description: description || null,
                price: parseFloat(price),
                discountPrice: discountPrice ? parseFloat(discountPrice) : null,
                stock: parseInt(stock),
                images,
                categoryId,
                brandId,
            },
            include: {
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
            }
        });

        res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (error) {
        console.error('Error in createProduct:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, discountPrice, stock, categoryId, brandId, isActive } = req.body;

        // Check if product exists and is not soft-deleted
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // If changing category, validate it exists
        if (categoryId) {
            const category = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
        }

        // If changing brand, validate it exists
        if (brandId) {
            const brand = await prisma.brand.findUnique({ where: { id: brandId } });
            if (!brand) {
                return res.status(404).json({ success: false, message: 'Brand not found' });
            }
        }

        // Re-generate slug if name changed
        let slug;
        if (name && name !== product.name) {
            slug = generateSlug(name);
            const existingSlug = await prisma.product.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.id !== id) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // If new images are uploaded, append them to existing images
        let images = product.images;
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
            images = [...product.images, ...newImages];
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(discountPrice !== undefined && { discountPrice: discountPrice ? parseFloat(discountPrice) : null }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(categoryId && { categoryId }),
                ...(brandId && { brandId }),
                ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
                images,
            },
            include: {
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
            }
        });

        res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        console.error('Error in updateProduct:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/admin/products/:id  (Soft Delete)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            }
        });

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProduct:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==================== PUBLIC CONTROLLERS ====================

// GET /api/products
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            sort = 'newest'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build the "where" filter object dynamically
        const where = {
            deletedAt: null,   // Always exclude soft-deleted products
            isActive: true,    // Always exclude inactive products
        };

        // Search filter — searches in both name and description
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Category filter
        if (category) {
            where.categoryId = category;
        }

        // Brand filter
        if (brand) {
            where.brandId = brand;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // Build the "orderBy" sort object
        let orderBy;
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'oldest':
                orderBy = { createdAt: 'asc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }

        // Run both queries in parallel for performance
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    category: { select: { id: true, name: true } },
                    brand: { select: { id: true, name: true } },
                }
            }),
            prisma.product.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalProducts: totalCount,
                limit: limitNum,
            }
        });
    } catch (error) {
        console.error('Error in getProducts:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                reviews: {
                    include: {
                        user: { select: { id: true, name: true, profileImage: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!product || product.deletedAt) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product fetched successfully', data: product });
    } catch (error) {
        console.error('Error in getProductById:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
