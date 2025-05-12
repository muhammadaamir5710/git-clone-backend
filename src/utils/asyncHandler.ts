import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

type SyncFunction = (req: Request, res: Response, next?: NextFunction) => void;

export const asyncHandler = (
  fn: AsyncFunction | SyncFunction
): RequestHandler => {
  return (req, res, next) => {
    if (fn.length === 2) {
      try {
        const result = fn(req, res);
        if (result instanceof Promise) {
          result.catch(next);
        }
      } catch (error) {
        next(error);
      }
    } else {
      Promise.resolve(fn(req, res, next)).catch(next);
    }
  };
};
