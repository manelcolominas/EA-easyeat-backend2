import { NextFunction, Request, Response } from 'express';
import DishService from '../services/dish';

const createDish = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedDish = await DishService.createDish(req.body);
        return res.status(201).json(savedDish);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dishId } = req.params;
    try {
        const dish = await DishService.getDish(dishId);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dishes = await DishService.getAllDishes();
        return res.status(200).json(dishes);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dishId } = req.params;
    try {
        const updatedDish = await DishService.updateDish(dishId, req.body);
        return updatedDish ? res.status(201).json(updatedDish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteDish = async (req: Request, res: Response, next: NextFunction) => {
    const { dishId } = req.params;
    try {
        const dish = await DishService.deleteDish(dishId);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};


export default { createDish, readDish, readAll, updateDish, deleteDish };
