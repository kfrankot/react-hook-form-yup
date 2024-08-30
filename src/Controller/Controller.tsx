import { ReactElement } from 'react'
import {
  FieldPath,
  FieldValues,
  ControllerProps as ControllerPropsRhf,
} from 'react-hook-form'
import { AllFieldProps, FieldProps } from 'yup-field-props-react'
import {
  GenericSchemaState,
  useController,
  UseControllerReturn,
} from '../useController'

export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends FieldProps = AllFieldProps,
> = Omit<ControllerPropsRhf<TFieldValues, TName>, 'render'> & {
  render: (
    props: UseControllerReturn<
      TFieldValues,
      TName,
      GenericSchemaState<TSchema>
    >,
  ) => ReactElement
}

export const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends FieldProps = AllFieldProps,
>(
  props: ControllerProps<TFieldValues, TName, TSchema>,
) => {
  const results = useController<TFieldValues, TName, TSchema>(props)
  return props.render(results)
}
