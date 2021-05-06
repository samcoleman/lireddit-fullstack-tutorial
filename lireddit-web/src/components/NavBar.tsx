import React from 'react'

import { Box, Flex } from '@chakra-ui/layout';
import { Button, Link } from '@chakra-ui/react';

//This does client side routing
import NextLink from 'next/link'
import { useMeQuery } from '../generated/graphql';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{data, fetching}] = useMeQuery();

    let body = null;

    // data is loading
    if (fetching) {

    // user not logged in
    } else if (!data?.me){
      body = (
        <>
          <NextLink href='/login'>
            <Link mr={2}>Login</Link>
          </NextLink>
          <NextLink href='/register'>
            <Link>Register</Link>
          </NextLink>
        </>
      )
    // user logged in
    }else {
      body = (
        <Flex>
          <Box mr={4}>{data.me.username}</Box>
          <Button variant='link'>Logout</Button>
        </Flex>
      )
    }

    return (
      <Flex bg='blue.600' p={4}>
        <Box ml={'auto'}>
          {body}
        </Box>
      </Flex>
    );
}