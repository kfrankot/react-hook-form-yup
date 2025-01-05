import { useMemo, useCallback } from 'react'
import {
  FieldValues,
  FieldPath,
  FieldPathValue,
  ControllerFieldState,
  ControllerRenderProps,
} from 'react-hook-form'
import {
  AllFieldProps,
  ArrayFieldProps,
  DateFieldProps,
  FieldProps,
  NumberFieldProps,
  StringFieldProps,
  useFieldProps,
} from 'yup-field-props-react'
import { useSchemaConfigs } from '../ConfigsProvider'
import {
  AllSchemaState,
  ArraySchemaState,
  BooleanSchemaState,
  DateSchemaState,
  NumberSchemaState,
  ObjectSchemaState,
  SchemaState,
  StringSchemaState,
} from '../types'

type IsAny<T> = 0 extends 1 & T ? true : false
type ExtractArrayElementType<T> = T extends Array<infer U> ? U : never

export type FieldPropsDynamicByType<T> = (Extract<T, string> extends never
  ? unknown
  : StringFieldProps) &
  (Extract<T, number> extends never ? unknown : NumberFieldProps) &
  (Extract<T, boolean> extends never ? unknown : FieldProps) &
  (Extract<T, Date> extends never ? unknown : DateFieldProps) &
  (Extract<T, Array<unknown>> extends never
    ? unknown
    : ArrayFieldProps<FieldPropsDynamicByType<ExtractArrayElementType<T>>>) &
  (T extends Record<string, unknown> ? FieldProps : unknown) &
  (T extends
    | string
    | number
    | boolean
    | Date
    | Array<unknown>
    | Record<string, unknown>
    ? unknown
    : AllFieldProps) &
  (IsAny<T> extends true ? AllFieldProps : FieldProps)

export type SchemaStateDynamicByType<T> = (Extract<T, string> extends never
  ? unknown
  : StringSchemaState) &
  (Extract<T, number> extends never ? unknown : NumberSchemaState) &
  (Extract<T, boolean> extends never ? unknown : BooleanSchemaState) &
  (Extract<T, Date> extends never ? unknown : DateSchemaState) &
  (Extract<T, Array<unknown>> extends never
    ? unknown
    : ArraySchemaState<FieldPropsDynamicByType<ExtractArrayElementType<T>>>) &
  (T extends Record<string, unknown> ? ObjectSchemaState : unknown) &
  (T extends
    | string
    | number
    | boolean
    | Date
    | Array<unknown>
    | Record<string, unknown>
    ? unknown
    : AllSchemaState) &
  (IsAny<T> extends true ? AllSchemaState : SchemaState)

export type SchemaStateDynamic<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = SchemaStateDynamicByType<FieldPathValue<TFieldValues, TName>>

export type UseSchemaControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends SchemaState = SchemaStateDynamic<TFieldValues, TName>,
> = Pick<ControllerRenderProps<TFieldValues, TName>, 'onChange' | 'onBlur'> & {
  schemaState: TSchema
}

export const useSchemaController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends SchemaState = SchemaStateDynamic<TFieldValues, TName>,
>(
  name: string,
  fieldState: ControllerFieldState,
): UseSchemaControllerReturn<TFieldValues, TName, TSchema> => {
  const schemaState = useFieldProps<TSchema>(name)

  const { schemaSyncMode, disableValidateOnSchemaSync, trigger } =
    useSchemaConfigs()

  const isTouched =
    schemaSyncMode === 'onTouched' ||
    schemaSyncMode === 'onChange' ||
    schemaSyncMode === 'all'
      ? fieldState.isTouched
      : null
  const deps = [
    isTouched,
    schemaSyncMode,
    disableValidateOnSchemaSync,
    trigger,
    schemaState.forceFormUpdate,
  ]

  const onChange = useCallback(() => {
    if (
      schemaSyncMode === 'onChange' ||
      schemaSyncMode === 'all' ||
      (schemaSyncMode === 'onTouched' && isTouched)
    ) {
      schemaState.forceFormUpdate()
      if (!disableValidateOnSchemaSync) {
        trigger()
      }
    }
  }, [...deps])

  const onBlur = useCallback(() => {
    if (
      schemaSyncMode === 'onBlur' ||
      schemaSyncMode === 'onTouched' ||
      schemaSyncMode === 'all'
    ) {
      schemaState.forceFormUpdate()
      if (!disableValidateOnSchemaSync) {
        trigger()
      }
    }
  }, [...deps])

  return useMemo(
    () => ({
      onChange,
      onBlur,
      schemaState,
    }),
    [onChange, onBlur, schemaState],
  )
}
