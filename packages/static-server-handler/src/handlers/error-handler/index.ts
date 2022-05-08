import type { NextFunction } from 'connect';

export default (next: NextFunction, err: Record<string, unknown>) => {
    if (err.status === 404) {
        return next();
    }
    next(err);
};
