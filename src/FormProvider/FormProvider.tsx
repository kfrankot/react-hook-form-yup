import React from 'react'
import {
  FormProvider as FormProviderRhf,
  FormProviderProps as FormProviderPropsRhf,
  FieldValues,
} from 'react-hook-form'
import { AnyObject, ObjectSchema } from 'yup'
import { ConfigsProvider, ConfigsProviderProps } from '../ConfigsProvider'

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends AnyObject = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = FormProviderPropsRhf<TFieldValues, TContext, TTransformedValues> & {
  schema: ObjectSchema<TFieldValues, TContext>
} & Partial<ConfigsProviderProps>

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
      <ConfigsProvider
        schema={schema}
        schemaSyncMode={schemaSyncMode}
        disableValidateOnSchemaSync={disableValidateOnSchemaSync}
      >
        {children}
      </ConfigsProvider>
    </FormProviderRhf>
  )
}
