import chalk from 'chalk';

export default class Logging {
  public static log = (...args: any[]) => this.info(...args);

  public static info = (...args: any[]) => console.log(chalk.blue(`[${new Date().toLocaleString()}] [INFO]`), ...args.map((arg) => (typeof arg === 'string' ? chalk.blueBright(arg) : arg)));

  public static warning = (...args: any[]) => console.log(chalk.yellow(`[${new Date().toLocaleString()}] [WARN]`), ...args.map((arg) => (typeof arg === 'string' ? chalk.yellowBright(arg) : arg)));

  public static error = (...args: any[]) => console.log(chalk.red(`[${new Date().toLocaleString()}] [ERROR]`), ...args.map((arg) => (typeof arg === 'string' ? chalk.redBright(arg) : arg)));
}
