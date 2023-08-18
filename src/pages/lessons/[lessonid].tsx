import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import rehypeHighlight from "rehype-highlight";
import { serialize } from 'next-mdx-remote/serialize'
import React from 'react';
import Head from 'next/head'
import path from 'path'
import { Link, Heading, Text, Alert, useColorModeValue, AlertIcon, AlertTitle, AlertDescription, ListItem, UnorderedList, OrderedList, Divider, Code, Box, Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon } from "@chakra-ui/react";
import Layout from '../../components/Layout'
import { postFilePaths, POSTS_PATH } from '../../utils/mdxUtils'
import KeyConcept from '../../components/KeyConcept';
// import hljs from 'highlight.js';
import langArduino from 'highlight.js/lib/languages/arduino'

// import 'highlight.js/styles/ascetic.css'
const languages = {
  arduino: langArduino

}

// Custom components/renderers to pass to MDX.
// Since the MDX files aren't loaded by webpack (or SWC, now.), they have no knowledge of how
// to handle import statements. Instead, you must include components in scope
// here.

//https://github.com/bogadrian/nextjs-chakra-ui-mdx-boilerplate/blob/1e2cae91f9668dfdf6f340703899ddcc262460fc/components/MDXComponents.tsx#L127
const components = {
  a: Link,
  h1: (props: any) => <Heading as="h1"  {...props} />,
  h2: (props: any) => <Heading as="h2" size='xl' {...props} />,
  h3: (props: any) => <Heading as="h3" size='lg' {...props} />,
  h4: (props: any) => <Heading as="h4" size='md' {...props} />,
  h5: (props: any) => <Heading as="h5" size='sm' {...props} />,
  h6: (props: any) => <Heading as="h6" size='xs' {...props} />,
  p: (props: any) => <Text as="p" mt={0} lineHeight="tall" {...props} />,
  /*li: (props: any) => <Box as="li" pb={1} {...props} />,
  ul: (props: any) => <Box as="ul" pt={2} pl={4} ml={2} {...props} />,
  ol: (props: any) => <Box as="ol" pt={2} pl={4} ml={2} {...props} />,
  */
  li: (props: any) => <ListItem {...props} />,
  ul: (props: any) => <UnorderedList {...props} />,
  ol: (props: any) => <OrderedList {...props} />,
  hr: (props: any) => <Divider {...props} />,
  // inlineCode: (props: any) => <Code className={useColorModeValue('bg-gray-100', 'bg-gray-700')} {...props} />,
  code: (props: any) => <Code className={useColorModeValue('bg-gray-100', 'bg-gray-700')} {...props} />,


  pre: (props: any) => <Box whiteSpace={"pre"}  {...props} />,//<Code display={"block"} whitespace="pre" className={useColorModeValue('bg-gray-100', 'bg-gray-700')} {...props} />,
  //  <Code display={"block"} {...props} />,
  // inlineCode: (props: any) => (
  //   <Code children={props} dip />
  // ),ç
  br: (props: any) => <br></br>,//<Box height="12px" {...props} />,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Head,
  KeyConcept,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
}

export default function PostPage({ source, frontMatter, lessons }: { source: any, frontMatter: { title: string, description: string }, lessons: any }): JSX.Element {
  return (
    <Layout lessons={lessons}>



      <div className="post-header">
        <Heading as="h2" size="xl" mb={5}>
          {frontMatter.title}
        </Heading>
        {/* <div className="post-subheader text-2xl">{frontMatter.description}</div> */}
        <Text className="description" mb={5}>{frontMatter.description}</Text>
        <Divider />
      </div>
      <main>

        <MDXRemote {...source} components={components} />
      </main>

      <style jsx>{`
        .post-header h1 {
          margin-bottom: 0;
        }

        .post-header {
          margin-bottom: 2rem;
        }
      `}</style>
    </Layout>
  )
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticPaths = async () => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map((lessonid) => ({ params: { lessonid } }))

  return {
    paths,
    fallback: false,
  }
}


export const getStaticProps = async ({ params }: { params: any }) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
  const postFilePath = path.join(POSTS_PATH, `${params.lessonid}.mdx`)
  // console.log(POSTS_PATH)
  const source = fs.readFileSync(postFilePath)

  const { content, data } = matter(source)
  const lessonInfo =
    postFilePaths.map((lesson_path) => {
      const postFilePath = path.join(POSTS_PATH, `${lesson_path}`);
      const source = fs.readFileSync(postFilePath);
      const matterContent = matter(source);
      return {
        path: lesson_path,
        ...matterContent.data,
      }
    }
    )
  // console.log(lessonInfo)

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      rehypePlugins: [[rehypeHighlight, {
        ignoreMissing: true,
        languages
      }]]
    },
    scope: data,
  })

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
      lessons: lessonInfo,
    },
  }
}

// export const getStaticProps = async ({ params }) => {
//   /* Get the path to the MDX file */
//   /* Open the MDX file and get its contents */
//   const postFilePath = path.join(POSTS_PATH, `${params.lessonid}.mdx`);
//   // Get the file contents
//   const source = fs.readFileSync(postFilePath);

//   const mdxSource = await serialize(source)
//   return { props: { source: mdxSource } }
// }

// // eslint-disable-next-line @typescript-eslint/require-await
// export async function getStaticPaths(){
//   return {
//     paths: [
//       { params: { lessonid: '1' } },
//       { params: { lessonid: 'INTRO' } },
//     ],
//     fallback: true
//   }
// }

// // export const getStaticProps = async ({ params: any }) => {
// //   //const postFilePath = path.join(POSTS_PATH, `${params.lessonid}.mdx`);
// //   //alert(postFilePath);
// //   //console.log(postFilePath);
// //   //const source = fs.readFileSync(postFilePath);

// //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// //   const { content, data } = matter(`
// //   # Lesson 1 - Basics 

// // ## Overview

// // What you will learn:
// // - What is an Arduino?
// // - How do you use one?
// // - How do you program one?
// // - What are its components?
// // - What does it do?
// // - Why is it important?
// // - Arduino IDE
// // - How do you load this up?
// // - C++ code, what is this?
// // - What is your mom
// // - You will make your own "hello world" code with the Arduino at the end.

// // ## Lesson

// // The Arduino is a tiny computer that takes instructions from your computer and sends them to devices you connect to the Arduino. You can connect many types of devices to an Arduino, including LEDs, sensors, and input devices such as buttons. You can even attach an LED screen to display things!

// // ### Pins/Components

// // There are many different Arduino boards, but we are focused on the Arduino UNO, the board in your kit.
// //   `);

// //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
// //   const mdxSource = await serialize(content, {
// //     // Optionally pass remark/rehype plugins
// //     mdxOptions: {
// //       remarkPlugins: [],
// //       rehypePlugins: [],
// //     },
// //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// //     scope: data,
// //   })

// //   return {
// //     props: {
// //       source: mdxSource,
// //       frontMatter: data,
// //     },
// //   }
// // }

// // // eslint-disable-next-line @typescript-eslint/require-await
// // export const getStaticPaths = async () => {
// //   const paths = postFilePaths
// //     // Remove file extensions for page paths
// //     .map((path) => path.replace(/\.mdx?$/, ''))
// //     // Map the path into the static paths object required by Next.js
// //     .map((slug) => ({ params: { slug } }))

// //   return {
// //     paths,
// //     fallback: false,
// //   }
// // }
