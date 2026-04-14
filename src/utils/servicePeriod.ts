import { DishModel } from '../models/dish';
import { IRestaurant } from '../models/restaurant';

export const SERVICE_PERIODS_CONFIG = [
    { period: 'breakfast', start: '03:30', end: '11:30', label: 'Breakfast' },
    { period: 'lunch',     start: '11:30', end: '16:30', label: 'Lunch'     },
    { period: 'dinner',    start: '16:30', end: '03:30', label: 'Dinner'    },
    { period: 'all-day',   start: '00:00', end: '23:59', label: 'All Day'   },
] as const;

export type ServicePeriod = typeof SERVICE_PERIODS_CONFIG[number]['period'];

const SERVICE_PERIODS = SERVICE_PERIODS_CONFIG; // just rename the import alias

function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function isTimeInCyclicPeriod(currentMinutes: number, startStr: string, endStr: string): boolean {
    const s = timeToMinutes(startStr);
    const e = timeToMinutes(endStr);
    if (s <= e) {
        return currentMinutes >= s && currentMinutes < e;
    } else {
        return currentMinutes >= s || currentMinutes < e;
    }
}

export function getCurrentServicePeriods(now: Date = new Date()): ServicePeriod[] {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const active = SERVICE_PERIODS.filter(({ start, end }) =>
        isTimeInCyclicPeriod(currentMinutes, start, end)
    ).map(p => p.period);
    active.push('all-day');
    return [...new Set(active)]; // deduplicate in case all-day was already matched
}

type TimetableDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
const DAYS: TimetableDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function isRestaurantOpenNow(timetable: IRestaurant['profile']['timetable'], now: Date = new Date()): boolean {
    if (!timetable) return false;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayStr = DAYS[now.getDay()];
    const todaySlots = timetable[todayStr];
    if (todaySlots) {
        const isOpenToday = todaySlots.some(({ open, close }) => {
            const s = timeToMinutes(open);
            const e = timeToMinutes(close);
            if (s < e) return currentMinutes >= s && currentMinutes < e;
            else return currentMinutes >= s;
        });
        if (isOpenToday) return true;
    }

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = DAYS[yesterdayDate.getDay()];
    const yesterdaySlots = timetable[yesterdayStr];
    if (yesterdaySlots) {
        const isOpenFromYesterday = yesterdaySlots.some(({ open, close }) => {
            const s = timeToMinutes(open);
            const e = timeToMinutes(close);
            if (s >= e) return currentMinutes < e;
            return false;
        });
        if (isOpenFromYesterday) return true;
    }

    return false;
}

// MODE 1 — Full menu, all dishes, each tagged with isAvailableNow for the frontend to grey out
export async function getFullMenu(restaurant_id: string, now: Date = new Date()) {
    const activePeriods = getCurrentServicePeriods(now);
    const dishes = await DishModel.find({ restaurant_id: restaurant_id, active: true });

    return dishes.map(dish => ({
        ...dish.toObject(),
        isAvailableNow: dish.availableAt?.some(p => activePeriods.includes(p as ServicePeriod)) ?? false
    }));
}

// MODE 2 — Only dishes available right now based on current time
export async function getCurrentMenu(restaurant_id: string, now: Date = new Date()) {
    const activePeriods = getCurrentServicePeriods(now);
    return DishModel.find({
        restaurant_id: restaurant_id,
        active: true,
        availableAt: { $in: activePeriods }
    });
}

// MODE 3 — admin manually picks a period to browse
export async function getMenuByPeriod(restaurant_id: string, period: ServicePeriod) {
    return DishModel.find({
        restaurant_id: restaurant_id,
        active: true,
        availableAt: period
    });
}