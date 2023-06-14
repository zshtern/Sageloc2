// This function should check name in special list and return true or false.
function checkIsDebugging(name): boolean {
  console.log(name);
  return true;
}

// This method decorator print execution time.
export function ProfileableMethod(
  target: Object,
  propertyName: string,
  propertyDesciptor: PropertyDescriptor): PropertyDescriptor {
  const method = propertyDesciptor.value;

  propertyDesciptor.value = function (...args: any[]) {
    const start = window.performance.now();

    const result = method.apply(this, args);

    const time = window.performance.now() - start;

    console.log(`Call: ${target.constructor.name}.${propertyName}() was executed in ${time} ms.`);

    return result;
  };

  return propertyDesciptor;
}

// This class provide debug method that print message if debug is enabled for the extended class.
export class Debuggable {
  private readonly prefix: string;
  private readonly isDebug: boolean;

  constructor(name) {
    this.isDebug = checkIsDebugging(name);
    this.prefix = name + ':';
  }

  public debug(message: string) {
    if (this.isDebug) console.log(this.prefix, message);
  }
}
