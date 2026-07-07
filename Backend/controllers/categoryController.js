import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Generate a URL-friendly slug from a name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ==================== ADMIN CONTROLLERS ====================

// POST /api/admin/categories
export const createCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        // If parentId is provided, verify parent category exists
        if (parentId) {
            const parent = await prisma.category.findUnique({ where: { id: parentId } });
            if (!parent || parent.deletedAt) {
                return res.status(404).json({ success: false, message: 'Parent category not found' });
            }
        }

        // Generate unique slug
        let slug = generateSlug(name);
        const existingSlug = await prisma.category.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // Handle optional image upload
        const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                image,
                parentId: parentId || null,
            },
            include: {
                parent: { select: { id: true, name: true } },
                children: { select: { id: true, name: true, slug: true } },
            }
        });

        res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    } catch (error) {
        console.error('Error in createCategory:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/admin/categories/:id
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId } = req.body;

        // Check if category exists and is not soft-deleted
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category || category.deletedAt) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // If changing parent, verify it exists and prevent self-referencing
        if (parentId) {
            if (parentId === id) {
                return res.status(400).json({ success: false, message: 'A category cannot be its own parent' });
            }
            const parent = await prisma.category.findUnique({ where: { id: parentId } });
            if (!parent || parent.deletedAt) {
                return res.status(404).json({ success: false, message: 'Parent category not found' });
            }
        }

        // Re-generate slug if name changed
        let slug;
        if (name && name !== category.name) {
            slug = generateSlug(name);
            const existingSlug = await prisma.category.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.id !== id) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Handle optional image upload — replaces old image
        const image = req.file ? `/uploads/categories/${req.file.filename}` : undefined;

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(image && { image }),
                ...(parentId !== undefined && { parentId: parentId || null }),
            },
            include: {
                parent: { select: { id: true, name: true } },
                children: { select: { id: true, name: true, slug: true } },
            }
        });

        res.status(200).json({ success: true, message: 'Category updated successfully', data: updatedCategory });
    } catch (error) {
        console.error('Error in updateCategory:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/admin/categories/:id  (Soft Delete)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({ where: { id } });
        if (!category || category.deletedAt) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error in deleteCategory:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==================== PUBLIC CONTROLLERS ====================

// GET /api/categories
export const getCategories = async (req, res) => {
    try {
        // Fetch only top-level categories (parentId is null) with their children nested
        const categories = await prisma.category.findMany({
            where: {
                deletedAt: null,
                parentId: null,   // Only top-level categories
            },
            include: {
                children: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                        children: {       // Supports one more level of nesting (grandchildren)
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                image: true,
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories });
    } catch (error) {
        console.error('Error in getCategories:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: { select: { id: true, name: true } },
                children: {
                    where: { deletedAt: null },
                    select: { id: true, name: true, slug: true, image: true }
                },
                products: {
                    where: { deletedAt: null, isActive: true },
                    include: {
                        brand: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!category || category.deletedAt) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category fetched successfully', data: category });
    } catch (error) {
        console.error('Error in getCategoryById:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
