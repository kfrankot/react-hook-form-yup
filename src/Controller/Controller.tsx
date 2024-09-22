import { ReactElement } from 'react'
import {
  FieldPath,
  FieldValues,
  ControllerProps as ControllerPropsRhf,
} from 'react-hook-form'
import {
  useController,
  UseControllerReturn,
  SchemaStateDynamic,
} from '../useController'
import { SchemaState } from '../types'

export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends SchemaState = SchemaStateDynamic<TFieldValues, TName>,
> = Omit<ControllerPropsRhf<TFieldValues, TName>, 'render'> & {
  render: (
    props: UseControllerReturn<TFieldValues, TName, TSchema>,
  ) => ReactElement
}

export const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSchema extends SchemaState = SchemaStateDynamic<TFieldValues, TName>,
>(
  props: ControllerProps<TFieldValues, TName, TSchema>,
) => {
  const results = useController<TFieldValues, TName, TSchema>(props)
  return props.render(results)
}
