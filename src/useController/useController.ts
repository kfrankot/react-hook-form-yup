import { useMemo, useCallback } from 'react'
import {
  useController as useControllerRhf,
  UseControllerProps as UseControllerPropsRhf,
  UseControllerReturn as UseControllerReturnRhf,
  FieldValues,
  FieldPath,
  FieldPathValue,
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
import { useConfigs } from '../ConfigsProvider'
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

export type FieldPropsDynamicByType<T> = (Extract<T, string> extends never
  ? unknown
  : StringFieldProps) &
  (Extract<T, number> extends never ? unknown : NumberFieldProps) &
  (Extract<T, boolean> extends never ? unknown : FieldProps) &
  (Extract<T, Date> extends never ? unknown : DateFieldProps) &
  (T extends Array<infer U>
    ? ArrayFieldProps<FieldPropsDynamicByType<U>>
    : unknown) &
  (T extends Record<string, unknown> ? FieldProps : unknown) &
  (T extends
    | string
    | number
    | boolean
    | Date
    | Array<unknown>
    | Record<string, unknown>
    ? FieldProps
    : AllFieldProps)

export type SchemaStateDynamicByType<T> = (Extract<T, string> extends never
  ? unknown
  : StringSchemaState) &
  (Extract<T, number> extends never ? unknown : NumberSchemaState) &
  (Extract<T, boolean> extends never ? unknown : BooleanSchemaState) &
  (Extract<T, Date> extends never ? unknown : DateSchemaState) &
  (T extends Array<infer U>
    ? ArraySchemaState<FieldPropsDynamicByType<U>>
    : unknown) &
  (T extends Record<string, unknown> ? ObjectSchemaState : unknown) &
  (T extends
    | string
    | number
    | boolean
    | Date
    | Array<unknown>
    | Record<string, unknown>
    ? SchemaState
    : AllSchemaState)

export type SchemaStateDynamic<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = SchemaStateDynamicByType<FieldPathValue<TFieldValues, TName>>

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends SchemaState = SchemaStateDynamic<TFieldValues, TName>,
> = UseControllerReturnRhf<TFieldValues, TName> & {
  schemaState: TSchema
}

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerPropsRhf<TFieldValues, TName>

export const useController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends SchemaState = SchemaStateDynamic<TFieldValues, TName>,
>({
  name,
  ...props
}: UseControllerProps<TFieldValues, TName>): UseControllerReturn<
  TFieldValues,
  TName,
  TSchema
> => {
  const schemaState = useFieldProps<TSchema>(name)
  const { field, fieldState, formState } = useControllerRhf({
    name,
    ...props,
  })

  const { schemaSyncMode, disableValidateOnSchemaSync, trigger } = useConfigs()

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

  const onChange = useCallback(
    (...event: unknown[]) => {
      field.onChange(...event)
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
    },
    [field.onChange, ...deps],
  )

  const onBlur = useCallback(() => {
    field.onBlur()
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
  }, [field.onBlur, ...deps])

  return useMemo(
    () => ({
      field: {
        ...field,
        onChange,
        onBlur,
      },
      fieldState,
      formState,
      schemaState,
    }),
    [field, fieldState, formState, onChange, onBlur, schemaState],
  )
}
