import VersionableMixin from './VersionableMixin';
import {Map} from '../shim';

/**
 * Reactive object provides ability to track its changes.
 * @remark
 * It's just a plain JavaScript object with certain set of properties. When any of them being updated, you can track
 * state change using {@link getVersion} method.
 *
 * All instances of ReactiveObject should be created using factory method {@link create}.
 *
 * N.B. According to limitation of JavaScript in work with object properties please mind this restriction to avoid
 * misunderstanding: ReactiveObject tracks only properties that passed to the constructor. That also means you shouldn't
 * add or delete properties on instance of ReactiveObject (it implies that those properties just won't be reactive).
 *
 * Let's track the 'foo' property:
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = ReactiveObject.create({
 *     foo: 'bar'
 * });
 * console.log(instance.foo, instance.getVersion()); // 'bar', 0
 * instance.foo = 'baz';
 * console.log(instance.foo, instance.getVersion()); // 'baz', 1
 * </pre>
 *
 * You can define read-only property just use
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get property getter}:
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = ReactiveObject.create({
 *     get foo() {
 *         return 'bar';
 *     }
 * });
 * console.log(instance.foo, instance.getVersion()); // 'bar', 0
 * instance.foo = 'baz'; // Throws an error
 * </pre>
 *
 * You can also define your own logic to read and write property value:
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = ReactiveObject.create({
 *     email: 'foo@bar.com',
 *     get domain(): string {
 *         return this.email.split('@')[1];
 *     },
 *     set domain(value: string) {
 *         const parts = this.email.split('@');
 *         parts[1] = value;
 *         this.email = parts.join('@');
 *     }
 * });
 * console.log(instance.email); // 'foo@bar.com'
 * console.log(instance.domain); // 'bar.com'
 * instance.domain = 'bar.org';
 * console.log(instance.email); // 'foo@bar.org'
 * console.log(instance.domain); // 'bar.org'
 * </pre>
 * @author Мальцев А.А.
 */
export default class ReactiveObject<T> extends VersionableMixin {
    protected constructor(data: T) {
        super();
        this._proxyProperties(data);
    }

    // region Protected

    /**
     * Proxies properties definition from given object to the current instance
     * @param donor Object to get properties declaration from
     */
    private _proxyProperties(donor: T): void {
        let storage: Map<string, T[keyof T]>;

        Object.keys(donor).forEach((key: string) => {
            let descriptor = Object.getOwnPropertyDescriptor(donor, key);

            if (descriptor.set) {
                // Wrap write operation in access descriptor
                descriptor.set = ((original) => (value) => {
                    const oldValue = this[key];
                    original.call(this, value);

                    if (value !== oldValue) {
                        this._nextVersion();
                    }
                })(descriptor.set);
            } else if (!descriptor.get) {
                if (!storage) {
                    storage = new Map<string, T[keyof T]>();
                }

                // Translate data descriptor to the access descriptor
                storage.set(key, descriptor.value);
                descriptor = {
                    get: () => storage.get(key),
                    set: descriptor.writable ? (value) => {
                        const oldValue = storage.get(key);
                        storage.set(key, value);

                        if (value !== oldValue) {
                            this._nextVersion();
                        }
                    } : undefined,
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable
                };
            }

            Object.defineProperty(this, key, descriptor);
        });

    }

    // endregion

    // region Statics

    // Static construction method only allows TypeScript interpreter to see T within ReactiveObject instance
    static create<T>(data: T): ReactiveObject<T> & T {
        return new ReactiveObject<T>(data) as ReactiveObject<T> & T;
    }

    // endregion
}