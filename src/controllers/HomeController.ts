import { Request, Response } from 'express';

export class HomeController {
  public async get(req: Request, res: Response): Promise<void> {
    // tslint:disable-next-line: no-console
    console.log(req.params);
    res.json({
      message: 'Home Controller'
    });
  }
}