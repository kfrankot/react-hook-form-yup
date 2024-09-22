import type {
  StringFieldProps,
  NumberFieldProps,
  FieldProps,
  AllFieldProps,
  ArrayFieldProps,
  MixedFieldProps,
  DateFieldProps,
  useFieldProps,
} from 'yup-field-props-react'

export type {
  StringFieldProps,
  NumberFieldProps,
  FieldProps,
  AllFieldProps,
  ArrayFieldProps,
  MixedFieldProps,
  DateFieldProps,
} from 'yup-field-props-react'

export type GenericSchemaState<TSchema extends FieldProps> = ReturnType<
  typeof useFieldProps<TSchema>
>
export type StringSchemaState = GenericSchemaState<StringFieldProps>
export type NumberSchemaState = GenericSchemaState<NumberFieldProps>
export type BooleanSchemaState = GenericSchemaState<FieldProps>
export type ObjectSchemaState = GenericSchemaState<FieldProps>
export type SchemaState = GenericSchemaState<FieldProps>
export type AllSchemaState = GenericSchemaState<AllFieldProps>
export type ArraySchemaState<T extends FieldProps = FieldProps> =
  GenericSchemaState<ArrayFieldProps<T>>
export type MixedSchemaState = GenericSchemaState<MixedFieldProps>
export type DateSchemaState = GenericSchemaState<DateFieldProps>
