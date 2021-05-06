import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

// Below creates a custon hook replacing "import { useMutation } from 'urql';" gives return types
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utlis/toErrorMap';
import { useRouter } from "next/router";

interface loginProps {

}

export const Login: React.FC<loginProps> = ({}) => {

  const router = useRouter();
  const [, login] = useLoginMutation()

  return (
    <Wrapper variant='small'>
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async(values, {setErrors}) => {
          // Can pass directly as varaibles are the same in values as the mutation string
          // Otherwise would do {user: values.username, pass: values.password}
          const response = await login({options: values});
          if (response.data?.login.errors){
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user){
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
                  Login
                </Button>
              </Box>
            </Form>
          )}
      </Formik>
    </Wrapper>
  )
}

export default Login;