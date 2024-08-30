import React, { useContext, createContext, useMemo, ReactNode } from 'react'
import { FieldValues, useFormContext, UseFormTrigger } from 'react-hook-form'
import { useCallbackRef } from '@radix-ui/react-use-callback-ref'
import { flatten } from 'flat'

export type Configs = {
  schemaSyncMode: 'onBlur' | 'onChange' | 'onTouched' | 'all' | false
  disableValidateOnSchemaSync: boolean
  trigger: UseFormTrigger<FieldValues>
}

export type ConfigsProviderProps = Pick<
  Configs,
  'schemaSyncMode' | 'disableValidateOnSchemaSync'
> & {
  children?: ReactNode
}

export const ConfigsContext = createContext<Configs>({
  schemaSyncMode: false,
  disableValidateOnSchemaSync: false,
  trigger: () => Promise.resolve(false),
})

export const ConfigsProvider = ({
  schemaSyncMode,
  disableValidateOnSchemaSync = false,
  children,
}: ConfigsProviderProps) => {
  const formContext = useFormContext()

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
      ? getKeyValuesFromFieldMap(formContext.formState.touchedFields)
      : []
    const dirtyFields = validateDirty
      ? getKeyValuesFromFieldMap(formContext.formState.dirtyFields)
      : []
    const fieldsToValidate =
      !touchedFields.length || !dirtyFields.length
        ? [...touchedFields, ...dirtyFields]
        : [...new Set([...touchedFields, ...dirtyFields])]
    return formContext.trigger(fieldsToValidate)
  })

  const context = useMemo(
    () => ({
      schemaSyncMode,
      disableValidateOnSchemaSync,
      trigger,
    }),
    [schemaSyncMode, disableValidateOnSchemaSync, trigger],
  )
  return (
    <ConfigsContext.Provider value={context}>
      {children}
    </ConfigsContext.Provider>
  )
}

export const useConfigs = () => useContext(ConfigsContext)
