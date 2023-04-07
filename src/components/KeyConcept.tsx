import { Card, CardHeader, CardBody, Heading, Text, Box, useColorMode} from '@chakra-ui/react';


const KeyConcept  = ({header ,children} : {header: string, children: any})=> {
    return (
        <Box p="10" margin="auto" width={{sm: "50%", md: "50%"}}>
        <Card background={'gray.300'}>
            <CardHeader>
                <Heading size='md'>
                    {header}
                </Heading>
            </CardHeader>
            <CardBody>
                <Text>
                    {children}
                </Text>
            </CardBody>
        </Card>
        </Box>
    )
}

export default KeyConcept;