export abstract class ValueObject<Value = unknown, Response = unknown> {
  public readonly value: Readonly<Value>

  protected constructor(value: Value) {
    this.value = value
  }

  abstract toValue(): Response
}
