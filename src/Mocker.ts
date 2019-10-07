type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

export type FunctionMock<
    TFunction extends (...args: any) => any
> = jest.MockInstance<ReturnType<TFunction>, ArgsType<TFunction>>;

export type FunctionsReplacedWithMocks<TObject> = {
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any) => any
        ? FunctionMock<TObject[TKey]>
        : TObject[TKey];
};

type FunctionMockWhenKeyMatches<
    TFunction,
    TKey,
    TExpectedKey
> = TKey extends TExpectedKey
    ? TFunction extends (...args: any) => any
        ? FunctionMock<TFunction>
        : never
    : TFunction;

type FunctionMockWhenKeyDoesNotMatch<
    TFunction,
    TKey,
    TExpectedKey
> = TKey extends TExpectedKey
    ? TFunction
    : TFunction extends (...args: any) => any
    ? FunctionMock<TFunction>
    : never;

export type OneFunctionReplacedWithMock<
    TObject,
    TFunctionKey extends keyof TObject
> = {
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any) => any
        ? FunctionMockWhenKeyMatches<TObject[TKey], TKey, TFunctionKey>
        : TObject[TKey];
} &
    TObject;

export type AllButOneFunctionReplacedWithMocks<
    TObject,
    TFunctionKey extends keyof TObject
> = {
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any) => any
        ? FunctionMockWhenKeyDoesNotMatch<TObject[TKey], TKey, TFunctionKey>
        : TObject[TKey];
} &
    TObject;

/**
 * The mocker helper class. Make it an available global in your tests
 * to leverage its enormous and beautiful functionality.
 */
export class Mocker {
    /**
     * Mutably mocks all functions in an object by spying on them and setting them
     * up to always return `undefined` as the default implementation.
     *
     * @returns The same instance of object, modified, typed as an object containing mocks.
     */
    public mockAllFunctionsInObject = <TObject>(
        object: TObject
    ): jest.Mocked<typeof object> =>
        this.conditionallyMockFunctionsInObject(object, _key => true, true);

    /**
     * Mutably mocks all functions in an object by spying on them and keeping
     * their real implementation by default.
     *
     * @returns The same instance of object, modified, typed as an object containing mocks.
     */
    public spyOnAllFunctionsInObject = <TObject>(
        object: TObject
    ): jest.Mocked<typeof object> =>
        this.conditionallyMockFunctionsInObject(object, _key => true, false);

    /**
     * Mutably mocks all functions but one in an object by spying on them and
     * keeping their real implementation by default.
     *
     * @returns The same instance of object, modified, typed as an object
     * containing relevant mocks.
     */
    public spyOnAllButOneFunctionInObject = <
        TObject,
        TFunctionKey extends keyof TObject
    >(
        object: TObject,
        functionName: TFunctionKey
    ): AllButOneFunctionReplacedWithMocks<typeof object, TFunctionKey> =>
        this.conditionallyMockFunctionsInObject(
            object,
            key => key === functionName,
            false
        );

    /**
     * Mocks just one function in an object by spying on it and setting it up to always
     * return `undefined` as the default implementation.
     *
     * @returns The same instance of object, modified, with the mocked function
     * strongly typed as a mock.
     */
    public mockOneFunctionInObject = <
        TObject extends {},
        TFunctionKey extends keyof TObject
    >(
        object: TObject,
        functionName: TFunctionKey
    ): OneFunctionReplacedWithMock<typeof object, TFunctionKey> =>
        this.conditionallyMockFunctionsInObject(
            object,
            key => key === functionName,
            true
        );

    /**
     * Mocks all functions except one in an object by spying on them and
     * setting them up to always return `undefined` as the default implementation.
     *
     * @returns The same instance of object, modified, with relevant mocked
     * functions strongly typed as mocks.
     */
    public mockAllButOneFunctionInObject = <
        TObject extends {},
        TFunctionKey extends keyof TObject
    >(
        object: TObject,
        functionName: TFunctionKey
    ): AllButOneFunctionReplacedWithMocks<typeof object, TFunctionKey> =>
        this.conditionallyMockFunctionsInObject(
            object,
            key => key !== functionName,
            true
        );

    /**
     * Restores any mocked functions in the object and mocks those functions for which
     * the specified predicate(key) is true.
     */
    private readonly conditionallyMockFunctionsInObject = <TObject extends {}>(
        object: TObject,
        predicate: (keyName: string) => boolean,
        shouldResetRealImplementation: boolean
    ): any => {
        const objectAsAny = object as any;

        Object.getOwnPropertyNames(object)
            .filter(key => typeof objectAsAny[key] === 'function')
            .forEach(key => {
                if (jest.isMockFunction(objectAsAny[key])) {
                    (objectAsAny[key] as jest.Mock).mockRestore();
                }

                if (!predicate(key)) {
                    return;
                }

                const spy = jest.spyOn(objectAsAny, key);

                if (shouldResetRealImplementation) {
                    spy.mockImplementation(() => undefined);
                }
            });

        return objectAsAny;
    };
}
