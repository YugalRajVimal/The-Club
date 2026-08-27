import { NextFunction, Request, Response } from "express";

// Wraps async route/controller functions so any rejected promise or thrown
// error is forwarded to Express's error-handling middleware instead of
// crashing the process or needing a try/catch in every controller.
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncFn) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
