import React from 'react'
import {
  FormProvider as FormProviderRhf,
  FormProviderProps as FormProviderPropsRhf,
  FieldValues,
} from 'react-hook-form'
import { AnyObject, ObjectSchema } from 'yup'
import {
  SchemaConfigsProvider,
  SchemaConfigsProviderProps,
} from '../SchemaConfigsProvider'

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends AnyObject = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = FormProviderPropsRhf<TFieldValues, TContext, TTransformedValues> & {
  schema: ObjectSchema<TFieldValues, TContext>
} & Partial<SchemaConfigsProviderProps>

export const FormProvider = <
  TFieldValues extends FieldValues,
  TContext extends AnyObject = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  schema,
  schemaSyncMode,
  disableValidateOnSchemaSync,
  children,
  ...props
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <FormProviderRhf {...props}>
      <SchemaConfigsProvider
        schema={schema}
        schemaSyncMode={schemaSyncMode}
        disableValidateOnSchemaSync={disableValidateOnSchemaSync}
      >
        {children}
      </SchemaConfigsProvider>
    </FormProviderRhf>
  )
}
