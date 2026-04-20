import { NextFunction, Request, Response } from 'express';
import DishService from '../services/dish';
import { getPaginationOptions } from '../utils/pagination';


const createDish = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedDish = await DishService.createDish(req.body);
        return res.status(201).json(savedDish);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const dish = await DishService.getDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDeletedDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const dish = await DishService.getDeletedDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { dishes, total }= await DishService.getAllDishes(skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { dishes, total } = await DishService.getAllDeletedDishes(skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const updatedDish = await DishService.updateDish(dish_id, req.body);
        return updatedDish ? res.status(201).json(updatedDish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const softDeleteDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const dish = await DishService.softDeleteDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const restoreDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const dish = await DishService.restoreDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const hardDeleteDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const dish = await DishService.hardDeleteDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createDish,
    readDish,
    readDeletedDish,
    readAll,
    readAllDeleted,
    updateDish,
    softDeleteDish,
    restoreDish,
    hardDeleteDish
};
