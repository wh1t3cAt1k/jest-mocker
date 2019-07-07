# jest-mocker

A mocking helper for those who would like to explicitly mock modules preserving compile-time type and refactoring safety.

# Usage

Inject a `Mocker` instance as a global (e.g. `mocker`) to use during your tests.

Then you can use e.g. `mocker.mockAllFunctionsInObject(ClassOrObject)` to replace all functions
within that object with mocks.

The function returns a strongly typed object containing mocks, so you can setup and verify calls on them.

On the other hand, you can continue invoking any method as usual through `ClassOrObject`, and your mocks will be called instead.