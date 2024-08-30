import type { GenericSchemaState } from '../useController'
import type {
  StringFieldProps,
  NumberFieldProps,
  FieldProps,
  AllFieldProps,
  ArrayFieldProps,
  MixedFieldProps,
  DateFieldProps,
} from 'yup-field-props-react'

export type StringSchemaState = GenericSchemaState<StringFieldProps>
export type NumberSchemaState = GenericSchemaState<NumberFieldProps>
export type SchemaState = GenericSchemaState<FieldProps>
export type AllSchemaState = GenericSchemaState<AllFieldProps>
export type ArraySchemaState = GenericSchemaState<ArrayFieldProps>
export type MixedSchemaState = GenericSchemaState<MixedFieldProps>
export type DateSchemaState = GenericSchemaState<DateFieldProps>
