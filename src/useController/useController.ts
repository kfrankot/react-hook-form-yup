import { useMemo, useCallback } from 'react'
import {
  useController as useControllerRhf,
  UseControllerProps as UseControllerPropsRhf,
  UseControllerReturn as UseControllerReturnRhf,
  FieldValues,
  FieldPath,
} from 'react-hook-form'
import { useFieldProps, FieldProps, AllFieldProps } from 'yup-field-props-react'
import { useConfigs } from '../ConfigsProvider'

export type GenericSchemaState<TSchema extends FieldProps> = ReturnType<
  typeof useFieldProps<TSchema>
>

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends FieldProps = AllFieldProps,
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
  TSchema extends FieldProps = AllFieldProps,
>({
  name,
  ...props
}: UseControllerProps<TFieldValues, TName>): UseControllerReturn<
  TFieldValues,
  TName,
  GenericSchemaState<TSchema>
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
