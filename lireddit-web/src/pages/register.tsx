import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

// Below creates a custon hook replacing "import { useMutation } from 'urql';" gives return types
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utlis/toErrorMap';
import { useRouter } from "next/router";

interface registerProps {

}

export const Register: React.FC<registerProps> = ({}) => {

  const router = useRouter();
  const [, register] = useRegisterMutation()

  return (
    <Wrapper variant='small'>
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async(values, {setErrors}) => {
          // Can pass directly as varaibles are the same in values as the mutation string
          // Otherwise would do {user: values.username, pass: values.password}
          const response = await register({options: values});
          if (response.data?.register.errors){
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user){
            // Login worked -> naviate to landing page
            router.push("/");
          }
        }}
        >
          { ({ isSubmitting }) => (
            <Form>
              <InputField
                name="username"
                placeholder="Username"
                label="Username"
              />
              <Box mt={4}>
                <InputField
                  name="password"
                  placeholder="Password"
                  label="Password"
                  type="password"
                />
              </Box>
              <Box mt={4}>
                <Button 
                  type='submit' 
                  isLoading={isSubmitting}
                >
                  Register
                </Button>
              </Box>
            </Form>
          )}
      </Formik>
    </Wrapper>
  )
}

export default Register