type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

export type FunctionMock<TFunction extends (...args: any) => any> = jest.Mock<ReturnType<TFunction>, ArgsType<TFunction>>;

export type FunctionsReplacedWithMocks<TObject> = {
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any) => any
        ? FunctionMock<TObject[TKey]>
        : TObject[TKey]
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
        : TObject[TKey]
};

export type AllButOneFunctionReplacedWithMocks<
    TObject,
    TFunctionKey extends keyof TObject
> = {
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any) => any
        ? FunctionMockWhenKeyDoesNotMatch<TObject[TKey], TKey, TFunctionKey>
        : TObject[TKey]
};

/**
 * The mocker helper class. Make it an available global in your tests 
 * to leverage its enormous and beautiful functionality.
 */
export class Mocker {
    public mockAllFunctionsInObject = <TObject>(
        object: TObject
    ): jest.Mocked<typeof object> =>
        this.conditionallyMockFunctionsInObject(object, _key => true);

    public mockOneFunctionInObject = <
        TObject extends {},
        TFunctionKey extends keyof TObject
    >(
        object: TObject,
        functionName: TFunctionKey
    ): OneFunctionReplacedWithMock<typeof object, TFunctionKey> =>
        this.conditionallyMockFunctionsInObject(
            object,
            key => key === functionName
        );

    public mockAllButOneFunctionInObject = <
        TObject extends {},
        TFunctionKey extends keyof TObject
    >(
        object: TObject,
        functionName: TFunctionKey
    ): AllButOneFunctionReplacedWithMocks<typeof object, TFunctionKey> =>
        this.conditionallyMockFunctionsInObject(
            object,
            key => key !== functionName
        );

    /**
     * Restores any mocked functions in the object and mocks those functions for which
     * the specified predicate(key) is true.
     */
    private readonly conditionallyMockFunctionsInObject = <TObject extends {}>(
        object: TObject,
        predicate: (keyName: string) => boolean
    ): any => {
        const objectAsAny = <any>object;

        Object.getOwnPropertyNames(object)
            .filter(key => typeof objectAsAny[key] === 'function')
            .forEach(key => {
                if (jest.isMockFunction(objectAsAny[key])) {
                    (objectAsAny[key] as jest.Mock).mockRestore();
                }

                if (predicate(key)) {
                    jest.spyOn(objectAsAny, key).mockImplementation(
                        () => undefined
                    );
                }
            });

        return objectAsAny;
    };
}
