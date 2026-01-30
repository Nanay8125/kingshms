import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const missingFields = schema.filter(field => body[field] === undefined);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`,
                code: 'VALIDATION_ERROR'
            });
        }
        next();
    };
};
