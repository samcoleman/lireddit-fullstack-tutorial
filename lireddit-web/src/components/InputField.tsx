import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  placeholder: string;
  name: string;
};

export const InputField: React.FC<InputFieldProps> = (props) => {

  const [field, {error}] = useField(props);

  // error = '' then !!'' => false
  // error = 'message' then !!'message' => true

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor="name">{props.label}</FormLabel>
      <Input 
        {...field} 
        {...props}
        id={field.name} 
        placeholder={props.placeholder} 
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}