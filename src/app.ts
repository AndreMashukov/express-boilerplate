import { ExpressServer } from './server';
import { Logger } from './utils/Logger';

/**
 * Wrapper around the Node process, ExpressServer abstraction
 * and complex dependencies such as services that ExpressServer needs.
 * When not using Dependency Injection, can be used as place
 * for wiring together services which are dependencies of ExpressServer.
 */

const logger = new Logger();

export class Application {
  public static async createApplication() {
    const expressServer = new ExpressServer();
    await expressServer.setup(8000);
    Application.handleExit(expressServer);

    return expressServer;
  }

  private static handleExit(express: ExpressServer) {
    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught exception', err);
      Application.shutdownProperly(1, express);
    });
    process.on('unhandledRejection', (reason: {} | null | undefined) => {
      logger.error('Unhandled Rejection at promise', reason);
      Application.shutdownProperly(2, express);
    });
    process.on('SIGINT', () => {
      logger.info('Caught SIGINT');
      Application.shutdownProperly(128 + 2, express);
    });
    process.on('SIGTERM', () => {
      logger.info('Caught SIGTERM');
      Application.shutdownProperly(128 + 2, express);
    });
    process.on('exit', () => {
      logger.info('Exiting');
    });
  }

  private static shutdownProperly(exitCode: number, express: ExpressServer) {
    Promise.resolve()
      .then(() => express.kill())
      .then(() => {
        console.log('Shutdown complete');
        process.exit(exitCode);
      })
      .catch(err => {
        console.error('Error during shutdown', err);
        process.exit(1);
      });
  }
}
