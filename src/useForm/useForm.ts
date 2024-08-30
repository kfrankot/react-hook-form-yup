import {
  useForm as useFormRhf,
  FieldValues,
  UseFormProps as UseFormPropsRhf,
  UseFormReturn as UseFormReturnRhf,
  Resolver,
} from 'react-hook-form'
import { AnyObject, ObjectSchema } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo } from 'react'

export type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends AnyObject = AnyObject,
> = Omit<UseFormPropsRhf<TFieldValues, TContext>, 'resolver' | 'context'> & {
  schema: ObjectSchema<TFieldValues, TContext>
  schemaOptions?: Parameters<typeof yupResolver<TFieldValues>>[1]
  resolverOptions?: Parameters<typeof yupResolver<TFieldValues>>[2]
  context?: TContext | (() => TContext)
}

export type UseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends AnyObject = AnyObject,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseFormReturnRhf<TFieldValues, TContext, TTransformedValues> & {
  schema: ObjectSchema<TFieldValues, TContext>
  context?: TContext | (() => TContext)
}

export const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext extends AnyObject = AnyObject,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  schema,
  schemaOptions,
  resolverOptions,
  context,
  ...props
}: UseFormProps<TFieldValues, TContext>): UseFormReturn<
  TFieldValues,
  TContext,
  TTransformedValues
> => {
  const resolver = useMemo(
    () => yupResolver(schema, schemaOptions, resolverOptions),
    [schema, schemaOptions, resolverOptions],
  ) as unknown as Resolver<TFieldValues, TContext>
  const form = useFormRhf<TFieldValues, TContext, TTransformedValues>({
    ...props,
    resolver,
    context: typeof context === 'function' ? context() : context,
  })

  return useMemo(
    () => ({
      ...form,
      schema,
      context,
    }),
    // Need to explicitly include form.formState in deps to account for formState proxy
    [form, form.formState, schema, context],
  )
}
