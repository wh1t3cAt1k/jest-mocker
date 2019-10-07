# jest-mocker

A mocking helper for those who would like to explicitly mock modules preserving compile-time type and refactoring safety.

## Usage

Inject a `Mocker` instance as a global (e.g. `mocker`) to use during your tests.

Then you can use e.g. `mocker.mockAllFunctionsInObject(ClassOrObject)` to replace all functions within that object with mocks.

The function returns a strongly typed object containing mocks, so you can setup and verify calls on them.

On the other hand, you can continue invoking any method as usual through `ClassOrObject`, and your mocks will be called instead.

## API

1. `mockAllFunctionsInObject` - mocks all functions in an object and resets their default implementation to always returning `undefined`.
1. `spyOnAllFunctionsInObject` - mocks all functions in an object and keeps their real implementation by default.
1. `mockOneFunctionInObject` - mocks just one function in an object and resets its default implementation to always returning `undefined`. The rest of the functions are not mocked.
1. `mockAllButOneFunctionInObject` - mocks all functions but one in an object and resets their default implementation to always returning `undefined`. The remaining function is not mocked.
1. `spyOnAllButOneFunctionInObject` - mocks all functions except one in an object and keeps their real implementation by default. The remaining function is not mocked.

All methods return a strongly typed object with relevant functions marked as mock instances.
