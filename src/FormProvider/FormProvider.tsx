import React from 'react'
import {
  FormProvider as FormProviderRhf,
  FormProviderProps as FormProviderPropsRhf,
  FieldValues,
} from 'react-hook-form'
import { AnyObject, ObjectSchema } from 'yup'
import { SchemaProvider } from 'yup-field-props-react'
import { ConfigsProvider, ConfigsProviderProps } from '../ConfigsProvider'

export type FormProviderProps<
  TFieldValues extends FieldValues,
  TContext extends AnyObject = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = FormProviderPropsRhf<TFieldValues, TContext, TTransformedValues> & {
  schema: ObjectSchema<TFieldValues, TContext>
  context?: TContext | (() => TContext)
} & Partial<ConfigsProviderProps>

// TODO: Re-export fieldprop types in a way that makes sense given the different prop naming here

export const FormProvider = <
  TFieldValues extends FieldValues,
  TContext extends AnyObject = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  schema,
  context,
  schemaSyncMode: schemaSyncModeProp,
  disableValidateOnSchemaSync: disableValidateOnSchemaSyncProp,
  children,
  control,
  ...props
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  // Default schemaSyncMode to onBlur if any pre-submit validation configured, otherwise set null to disable
  // schema syncing until the submit operation triggers a re-render itself
  const mode = control._options.mode
  const reValidateMode = control._options.reValidateMode
  const submitCount = props.formState.submitCount
  const currentMode =
    submitCount > 0 ? (reValidateMode ?? 'onChange') : (mode ?? 'onSubmit')
  // const schemaSyncMode =
  //   schemaSyncModeProp ?? (currentMode === 'onSubmit' ? null : 'onBlur')
  const schemaSyncMode = schemaSyncModeProp ?? 'onBlur'
  // If only validating on submit, don't bother updating validation to match the schema props, let the submit handle it
  const disableValidateOnSchemaSync =
    disableValidateOnSchemaSyncProp ?? currentMode === 'onSubmit'
  return (
    <FormProviderRhf control={control} {...props}>
      <ConfigsProvider
        schemaSyncMode={schemaSyncMode}
        disableValidateOnSchemaSync={disableValidateOnSchemaSync}
      >
        <SchemaProvider
          schema={schema}
          values={props.getValues}
          context={context}
        >
          {children}
        </SchemaProvider>
      </ConfigsProvider>
    </FormProviderRhf>
  )
}