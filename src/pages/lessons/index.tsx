import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import path from 'path'
import { Link, Heading, Text, Alert, AlertIcon, AlertTitle, AlertDescription, ListItem, UnorderedList, OrderedList,   Divider, Code, Box, Flex, Spacer, HStack, VStack, Card } from "@chakra-ui/react";
import Layout from '../../components/Layout'

export default function PostPage({ source }: {source: any}): JSX.Element {
  return (
    <Layout>
      <main>
      <Flex>
        <Spacer />
            <VStack>
                <Heading>
                    INOArduino
                </Heading>
                <Text>
                    Welcome to the INOArduino App! This app is designed to help you learn how to use the Arduino IDE and the Arduino Uno board.
                </Text>
            </VStack>
        <Spacer />
        </Flex>
        
      </main>
    </Layout>
  )
}
