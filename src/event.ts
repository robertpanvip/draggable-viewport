export type EventArgs = { [key: string]: any }

export type EventNames<M extends EventArgs> = Extract<keyof M, string>
export type UnknownNames<M extends EventArgs> = Exclude<string, EventNames<M>>
/**
 * PickByValue
 * @desc From `T` pick a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { req: number }
 *   type Props = PickByValue<Props, number>;
 *   // Expect: { req: number; reqUndef: number | undefined; }
 *   type Props = PickByValue<Props, number | undefined>;
 */
export declare type PickByValue<T, ValueType> = Pick<T, {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
}[keyof T]>;

/**
 * RequiredKeys
 * @desc Get union type of keys that are required in object type `T`
 * @see https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; optUndef?: number | undefined; };
 *
 *   // Expect: "req" | "reqUndef"
 *   type Keys = RequiredKeys<Props>;
 */
export declare type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * OmitByValue
 * @desc From `T` remove a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { reqUndef: number | undefined; opt?: string; }
 *   type Props = OmitByValue<Props, number>;
 *   // Expect: { opt?: string; }
 *   type Props = OmitByValue<Props, number | undefined>;
 */
export declare type OmitByValue<T, ValueType> = Pick<T, {
    [Key in keyof T]-?: T[Key] extends ValueType ? never : Key;
}[keyof T]>;

/**
 * OptionalKeys
 * @desc Get union type of keys that are optional in object type `T`
 * @see https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; optUndef?: number | undefined; };
 *
 *   // Expect: "opt" | "optUndef"
 *   type Keys = OptionalKeys<Props>;
 */
export declare type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type Handler<Args> = Args extends null | undefined
    ? () => any
    : Args extends any[]
        ? (...args: Args) => any
        : (args: Args) => any

/**
 * Get union type of keys from `M` that value matching `any[]`.
 */
export type NamesWithArrayArgs<M extends EventArgs> = RequiredKeys<
    PickByValue<M, any[]>
    >

export type NotArrayValueMap<M extends EventArgs> = OmitByValue<M, any[]>

export type OptionalNormalNames<M extends EventArgs> = OptionalKeys<
    NotArrayValueMap<M>
    >

export type RequiredNormalNames<M extends EventArgs> = RequiredKeys<
    NotArrayValueMap<M>
    >

export type OtherNames<M extends EventArgs> = EventNames<
    PickByValue<M, undefined>
    >
export type AsyncBoolean = boolean | Promise<boolean>

export function isAsyncLike<T>(obj: any): obj is Promise<T> {
    return typeof obj === 'object' && obj.then && typeof obj.then === 'function'
}

export function isAsync<T>(obj: any): obj is Promise<T> {
    return obj != null && (obj instanceof Promise || isAsyncLike(obj))
}

export function toAsyncBoolean(...inputs: (any | any[])[]): AsyncBoolean {
    const results: any[] = []

    inputs.forEach((arg) => {
        if (Array.isArray(arg)) {
            results.push(...arg)
        } else {
            results.push(arg)
        }
    })

    const hasAsync = results.some((res) => isAsync(res))
    if (hasAsync) {
        const deferres = results.map((res) =>
            isAsync(res) ? res : Promise.resolve(res !== false),
        )

        return Promise.all(deferres).then((arr) =>
            arr.reduce<boolean>((memo, item) => item !== false && memo, true),
        )
    }

    return results.every((res) => res !== false)
}

export function call(list: any[], args?: any[]) {
    const results: any[] = []
    for (let i = 0; i < list.length; i += 2) {
        const handler = list[i]
        const context = list[i + 1]
        const params = Array.isArray(args) ? args : [args]
        const ret = handler.call(context,...params)
        results.push(ret)
    }

    return toAsyncBoolean(results)
}
export class Events<Args extends EventArgs = any> {
    private listeners: { [name: string]: any[] } = {}

    on<Name extends EventNames<Args>>(
        name: Name,
        handler: Handler<Args[Name]>,
        context?: any,
    ): this
    on<Name extends UnknownNames<Args>>(
        name: Name,
        handler: Handler<any>,
        context?: any,
    ): this
    on<Name extends EventNames<Args>>(
        name: Name,
        handler: Handler<Args[Name]>,
        context?: any,
    ) {
        if (handler == null) {
            return this
        }

        if (!this.listeners[name]) {
            this.listeners[name] = []
        }
        const cache = this.listeners[name]
        cache.push(handler, context)

        return this
    }

    once<Name extends EventNames<Args>>(
        name: Name,
        handler: Handler<Args[Name]>,
        context?: any,
    ): this
    once<Name extends UnknownNames<Args>>(
        name: Name,
        handler: Handler<any>,
        context?: any,
    ): this
    once<Name extends EventNames<Args>>(
        name: Name,
        handler: Handler<Args[Name]>,
        context?: any,
    ) {
        const cb = (...args: any) => {
            this.off(name, cb as any)
            return call([handler, context], args)
        }

        return this.on(name, cb as any, this)
    }

    off(): this
    off(name: null, handler: Handler<any>): this
    off(name: null, handler: null, context: any): this
    off<Name extends EventNames<Args>>(
        name: Name,
        handler?: Handler<Args[Name]>,
        context?: any,
    ): this
    off<Name extends UnknownNames<Args>>(
        name: Name,
        handler?: Handler<any>,
        context?: any,
    ): this
    off(name?: string | null, handler?: Handler<any> | null, context?: any) {
        // remove all events.
        if (!(name || handler || context)) {
            this.listeners = {}
            return this
        }

        const listeners = this.listeners
        const names = name ? [name] : Object.keys(listeners)

        names.forEach((n) => {
            const cache = listeners[n]
            if (!cache) {
                return
            }

            // remove all events with specified name.
            if (!(handler || context)) {
                delete listeners[n]
                return
            }

            for (let i = cache.length - 2; i >= 0; i -= 2) {
                if (
                    !(
                        (handler && cache[i] !== handler) ||
                        (context && cache[i + 1] !== context)
                    )
                ) {
                    cache.splice(i, 2)
                }
            }
        })

        return this
    }

    trigger<Name extends OptionalNormalNames<Args>>(
        name: Name,
    ): AsyncBoolean
    trigger<Name extends RequiredNormalNames<Args>>(
        name: Name,
        args: Args[Name],
    ): AsyncBoolean
    trigger<Name extends NamesWithArrayArgs<Args>>(
        name: Name,
        ...args: Args[Name]
    ): AsyncBoolean
    trigger<Name extends OtherNames<Args>>(
        name: Name,
        args?: Args[Name],
    ): AsyncBoolean
    trigger<Name extends OtherNames<Args>>(
        name: Name,
        ...args: Args[Name]
    ): AsyncBoolean
    trigger<Name extends UnknownNames<Args>>(
        name: Name,
        ...args: any[]
    ): AsyncBoolean
    trigger<Name extends EventNames<Args>>(name: Name, ...args: any[]) {
        let returned: AsyncBoolean = true
        if (name !== '*') {
            const list = this.listeners[name]
            if (list != null) {
                returned = call([...list], args)
            }
        }

        const list = this.listeners['*']
        if (list != null) {
            return toAsyncBoolean([
                returned,
                call([...list], [name, ...args]),
            ])
        }

        return returned
    }
}