# react-hook-form-yup

Enhances the integration of `yup` schemas into `react-hook-form`.

## Description

This library provides the current schema validation rules as properties on `Controller` and `useController`, making them easy to display in your UI.

How it works:

1. Describes the schema based on current form values when components re-render
2. Evaluates references in the schema description
3. Extracts validation rules as simple properties and adds them to the `useController` hook
4. Sychronize field validation state and schema props with conditional schema rules based on the current form values

## Installation

```bash
npm install react-hook-form-yup
```

## Example

### Schema definition

```typescript
import * as yup from 'yup'

const schema = yup.object().shape({
  minSize: yup.number().moreThan(1).lessThan(yup.ref('maxSize')).required(),
  maxSize: yup.number().moreThan(yup.ref('minSize')).required(),
})
```

### Form setup

```tsx
import React from 'react'
import {
  useForm,
  FormProvider,
  useController,
  NumberSchemaState,
} from 'react-hook-form-yup'
import { schema } from './schema'

const NumberInput = (props: { name: string; type: string }) => {
  const {
    field,
    fieldState: { error },
    // schemaState reflects the validation rules for the given field
    schemaState,
  } = useController<any, any, NumberSchemaState>(props.name)

  // Build a placeholder based on the numeric range validations
  const { required, min, max, lessThan, moreThan } = schemaState
  const minMsg = min ? `Min ${min}` : moreThan ? `More than ${moreThan}` : ''
  const maxMsg = max ? `Max ${max}` : lessThan ? `Less than ${lessThan}` : ''
  const placeholder = [minMsg, maxMsg].filter(Boolean).join(' and ')

  return (
    <div>
      <input
        {...field}
        style={{ display: 'block', width: 250 }}
        // Set the required prop based on the schema state
        required={required}
        placeholder={placeholder}
      />
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  )
}

const MyForm = () => {
  // Pass the schema into useForm, resolver is setup internally
  const props = useForm({ schema })

  return (
    <FormProvider {...props}>
      <NumberInput name="minSize" type="number" />
      <NumberInput name="maxSize" type="number" />
    </FormProvider>
  )
}

export default MyForm
```

### Controller component

The `Controller` component has been enhanced with the same `schemaState` property that's available in the `useController` hook.

## Customization

This library keeps schema state and form validation aligned with form values. By default, the schema state updates on blur, allowing evaluated refs and conditional validations to display in the UI. The library also revalidates fields when needed based on the current validation mode. You can customize these behaviors:

### Schema sync mode

Set when the schema props sync with form values. Options: `onBlur` (default), `onTouched`, `onChange`, `all`, or `false` (to disable)

```tsx
<FormProvider schemaSyncMode="onChange" {...props} />
```

### Disable validate on schema sync

Set `disableValidateOnSchemaSync` to disable validation from occuring on schema sync. This defaults to `true` if `useForm` is set with `mode` "onSubmit" and `submitCount` is 0, or with `reValidateMode` "onSubmit" and `submitCount` is greater than 0. Otherwise it defaults to `false`.

```tsx
<FormProvider disableValidateOnSchemaSync {...props} />
```

## Advanced usage

While this library provides overrides of `useForm`, `useController`, and `FormProvider` from the `react-hook-form` library, these could create too tight of a binding between `react-hook-form` and `react-hook-form-yup` for advanced use cases. For more complex setups, you can alternatively utilize the `SchemaConfigsProvider` component and `useSchemaController` hook, which are used internally by the `FormProvider` and `useController` hooks.

### Form setup

The below example is functionaly equivalent to the previous form setup example. The setup is a bit more complex, but offers greater flexibility.

```tsx
import React from 'react'
import { useForm, FormProvider, useController } from 'react-hook-form'
import { SchemaConfigsProvider, useSchemaController } from 'react-hook-form-yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { schema } from './schema'

const NumberInput = (props: { name: string; type: string }) => {
  const { field, fieldState } = useController<any, any, NumberSchemaState>(
    props.name,
  )

  // Get only the schema props, separately from useController
  const { schemaState, ...schemaProps } = useSchemaController<
    any,
    any,
    NumberSchemaState
  >(props.name, fieldState)
  const { required, min, max, lessThan, moreThan } = schemaState
  const minMsg = min ? `Min ${min}` : moreThan ? `More than ${moreThan}` : ''
  const maxMsg = max ? `Max ${max}` : lessThan ? `Less than ${lessThan}` : ''
  const placeholder = [minMsg, maxMsg].filter(Boolean).join(' and ')

  const onChange = (event) => {
    field.onChange(event)
    // Call onChange for the schema props on react-hook-form-yup separately
    schemaProps.onChange()
  }
  const onBlur = (event) => {
    field.onBlur(event)
    // Call onBlur for the schema props on react-hook-form-yup separately
    schemaProps.onBlur()
  }

  return (
    <div>
      <input
        {...field}
        onChange={onChange}
        onBlur={onBlur}
        style={{ display: 'block', width: 250 }}
        required={required}
        placeholder={placeholder}
      />
      {fieldState.error && (
        <p style={{ color: 'red' }}>{fieldState.error.message}</p>
      )}
    </div>
  )
}

const MyForm = () => {
  const resolver = React.useMemo(() => yupResolver(schema), [schema])
  const props = useForm({ resolver })

  return (
    <FormProvider {...props}>
      {/* Set react-hook-form-yup provider props on SchemaConfigsProvider instead of useForm and FormProvider */}
      <SchemaConfigsProvider
        schema={schema}
        schemaSyncMode="onBlur"
        disableValidateOnSchemaSync={false}
      >
        <NumberInput name="minSize" type="number" />
        <NumberInput name="maxSize" type="number" />
      </SchemaConfigsProvider>
    </FormProvider>
  )
}

export default MyForm
```

## Limitations

Currently, this only works when using a `FormProvider`, and does not have support for `register` based forms. It also only works with synchronous schema.
