import prisma from '../database/prisma.js';

// Helper: Generate a URL-friendly slug from a name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ==================== ADMIN CONTROLLERS ====================

// POST /api/admin/brands
export const createBrand = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Brand name is required' });
        }

        // Check if brand name already exists (name is @unique)
        const existingBrand = await prisma.brand.findUnique({ where: { name } });
        if (existingBrand) {
            return res.status(409).json({ success: false, message: 'Brand with this name already exists' });
        }

        // Generate unique slug
        let slug = generateSlug(name);
        const existingSlug = await prisma.brand.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // Handle optional logo upload
        const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                logo,
                description: description || null,
            }
        });

        res.status(201).json({ success: true, message: 'Brand created successfully', data: brand });
    } catch (error) {
        console.error('Error in createBrand:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/admin/brands/:id
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Check if brand exists
        const brand = await prisma.brand.findUnique({ where: { id } });
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }

        // If changing name, check uniqueness
        if (name && name !== brand.name) {
            const existingBrand = await prisma.brand.findUnique({ where: { name } });
            if (existingBrand) {
                return res.status(409).json({ success: false, message: 'Brand with this name already exists' });
            }
        }

        // Re-generate slug if name changed
        let slug;
        if (name && name !== brand.name) {
            slug = generateSlug(name);
            const existingSlug = await prisma.brand.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.id !== id) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Handle optional logo upload — replaces old logo
        const logo = req.file ? `/uploads/brands/${req.file.filename}` : undefined;

        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(logo && { logo }),
                ...(description !== undefined && { description: description || null }),
            }
        });

        res.status(200).json({ success: true, message: 'Brand updated successfully', data: updatedBrand });
    } catch (error) {
        console.error('Error in updateBrand:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/admin/brands/:id  (Hard Delete)
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await prisma.brand.findUnique({ where: { id } });
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }

        // Check if any products are linked to this brand
        const productCount = await prisma.product.count({ where: { brandId: id } });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete brand. ${productCount} product(s) are still linked to it. Remove or reassign them first.`
            });
        }

        await prisma.brand.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
        console.error('Error in deleteBrand:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==================== PUBLIC CONTROLLERS ====================

// GET /api/brands
export const getBrands = async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        });

        res.status(200).json({ success: true, message: 'Brands fetched successfully', data: brands });
    } catch (error) {
        console.error('Error in getBrands:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/brands/:id
export const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await prisma.brand.findUnique({
            where: { id },
            include: {
                products: {
                    where: { deletedAt: null, isActive: true },
                    include: {
                        category: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }

        res.status(200).json({ success: true, message: 'Brand fetched successfully', data: brand });
    } catch (error) {
        console.error('Error in getBrandById:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
