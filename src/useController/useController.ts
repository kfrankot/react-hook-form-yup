import { useMemo, useCallback } from 'react'
import {
  useController as useControllerRhf,
  UseControllerProps as UseControllerPropsRhf,
  UseControllerReturn as UseControllerReturnRhf,
  FieldValues,
  FieldPath,
} from 'react-hook-form'
import { SchemaState } from '../types'
import { SchemaStateDynamic, useYupController } from '../useYupController'

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
  const { field, fieldState, formState } = useControllerRhf({
    name,
    ...props,
  })
  const {
    onChange: onChangeYup,
    onBlur: onBlurYup,
    schemaState,
  } = useYupController<TFieldValues, TName, TSchema>(name, fieldState)

  const onChange = useCallback(
    (...event: unknown[]) => {
      field.onChange(...event)
      onChangeYup()
    },
    [field.onChange, onChangeYup],
  )

  const onBlur = useCallback(() => {
    field.onBlur()
    onBlurYup()
  }, [field.onBlur, onBlurYup])

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
