import React, { useContext, createContext, useMemo, ReactNode } from 'react'
import { FieldValues, useFormContext, UseFormTrigger } from 'react-hook-form'
import { useCallbackRef } from '@radix-ui/react-use-callback-ref'
import { flatten } from 'flat'
import { SchemaProvider } from 'yup-field-props-react'
import { ObjectSchema } from 'yup'

export type SchemaConfigs = {
  schemaSyncMode: 'onBlur' | 'onChange' | 'onTouched' | 'all' | false
  disableValidateOnSchemaSync: boolean
  trigger: UseFormTrigger<FieldValues>
}

export type SchemaConfigsProviderProps = Pick<
  Partial<SchemaConfigs>,
  'schemaSyncMode' | 'disableValidateOnSchemaSync'
> & {
  schema: ObjectSchema<any>
  children?: ReactNode
}

export const SchemaConfigsContext = createContext<SchemaConfigs>({
  schemaSyncMode: false,
  disableValidateOnSchemaSync: false,
  trigger: () => Promise.resolve(false),
})

export const SchemaConfigsProvider = ({
  schema,
  schemaSyncMode: schemaSyncModeProp,
  disableValidateOnSchemaSync: disableValidateOnSchemaSyncProp,
  children,
}: SchemaConfigsProviderProps) => {
  const formContext = useFormContext()
  const {
    formState: { submitCount },
  } = formContext

  const mode = formContext.control._options.mode
  const reValidateMode = formContext.control._options.reValidateMode
  const currentMode =
    submitCount > 0 ? (reValidateMode ?? 'onChange') : (mode ?? 'onSubmit')
  // Only force sync of schema state onBlur by default for performance reasons
  const schemaSyncMode = schemaSyncModeProp ?? 'onBlur'
  // If only validating on submit, don't bother updating validation to match the schema props, let the submit handle it
  const disableValidateOnSchemaSync =
    disableValidateOnSchemaSyncProp ?? currentMode === 'onSubmit'

  // Allow re-triggering validation on fields which should have already been validated once
  // based on given configurations, to allow syncing with potentially conditional schema
  const trigger = useCallbackRef(() => {
    const validateDirty =
      schemaSyncMode === 'all' ||
      schemaSyncMode === 'onChange' ||
      schemaSyncMode === 'onTouched'
    const validateTouched =
      schemaSyncMode === 'all' ||
      schemaSyncMode === 'onTouched' ||
      schemaSyncMode === 'onBlur'
    const getKeyValuesFromFieldMap = (
      fieldMap: Partial<
        Readonly<{
          [x: string]: unknown
        }>
      >,
    ) => {
      const flattened: Record<string, boolean> = flatten(fieldMap)
      return Object.keys(flattened).filter((key) => flattened[key])
    }
    const touchedFields = validateTouched
      ? getKeyValuesFromFieldMap(formContext.formState.touchedFields ?? {})
      : []
    const dirtyFields = validateDirty
      ? getKeyValuesFromFieldMap(formContext.formState.dirtyFields ?? {})
      : []
    const fieldsToValidate =
      !touchedFields.length || !dirtyFields.length
        ? [...touchedFields, ...dirtyFields]
        : [...new Set([...touchedFields, ...dirtyFields])]
    return formContext.trigger(fieldsToValidate)
  })

  const configsContext = useMemo(
    () => ({
      schemaSyncMode,
      disableValidateOnSchemaSync,
      trigger,
    }),
    [schemaSyncMode, disableValidateOnSchemaSync, trigger],
  )
  return (
    <SchemaConfigsContext.Provider value={configsContext}>
      <SchemaProvider
        schema={schema}
        values={formContext.getValues}
        context={formContext.control._options.context}
      >
        {children}
      </SchemaProvider>
    </SchemaConfigsContext.Provider>
  )
}

export const useSchemaConfigs = () => useContext(SchemaConfigsContext)
