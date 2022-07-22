// TODO Use type-fest to replace this file later on.

declare namespace Common {
  export type ValueOf<ObjectType, ValueType extends keyof ObjectType = keyof ObjectType> = ObjectType[ValueType]
}
