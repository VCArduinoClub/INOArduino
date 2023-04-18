/* eslint-disable @typescript-eslint/no-misused-promises */
import Layout from '../../components/Layout';
import { useState, useRef, useEffect, ChangeEventHandler } from 'react';
import { buildHex } from "../../utils/sim/compile";
import { AVRRunner } from "../../utils/sim/execute";
import { LEDElement } from "@wokwi/elements";
import { Alert, AlertDescription, AlertTitle, Button, Stack, Text, Textarea, useToast, Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react';
import Editor, { Monaco } from "@monaco-editor/react";


const SimPage = () => {
  return (
    <Layout lessons={[]}>
      <ArduinoSim />
    </Layout>
  )
}

const exampleCode =
  `
byte leds[] = {13, 12, 11};
void setup() {
  Serial.begin(115200);
  for (byte i = 0; i < sizeof(leds); i++) {
    pinMode(leds[i], OUTPUT);
  }
}

int i = 0;
void loop() {
  Serial.print("LED: ");
  Serial.println(i);
  digitalWrite(leds[i], HIGH);
  delay(250);
  digitalWrite(leds[i], LOW);
  i = (i + 1) % sizeof(leds);
}
`;
let serial = "";
const ArduinoSim = () => {
  const [isRunning, setRunningState] = useState(false);
  const [arduinoCode, setArduinoCode] = useState(exampleCode);
  const [online, setOnlineState] = useState(true);
  const [hexcode, setHexcode] = useState("");
  const [ser, setSer] = useState("");
  const [usingMonaco, setUsingMonaco] = useState(false);
  const textAreaMultiplier = 1; // Set the textarea height to the number of lines
  const textAreaHeight = arduinoCode.split(/\r\n|\r|\n/).length * textAreaMultiplier;
  const toast = useToast();
  const editorRef = useRef(null);
  let runner: AVRRunner;
  useEffect(function () {
    if (typeof window !== "undefined") {
      setOnlineState(navigator.onLine)
      window.addEventListener("offline", function () {
        setOnlineState(false);
      });
      window.addEventListener("online", function () {
        setOnlineState(true);
      });
    }
  }, [online])

  function handleEditorDidMount(editor: any, _: Monaco) {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    console.log("[debug] Monaco Editor loaded");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    editorRef.current = editor;
    setUsingMonaco(true);
  }

  function executeProgram(hex: string) {
    runner = new AVRRunner(hex);

    runner.usart.onByteTransmit = (value: number) => {

      console.log(String.fromCharCode(value));
      // serial += String.fromCharCode(value);
      setSer((prev) => prev + String.fromCharCode(value));
    };

    runner.execute((cpu) => {
      const time = (cpu.cycles / runner.MHZ);
    });
    // console.log(runner)
  }


  async function compileAndRun() {
    console.log("Compiling...");
    const result = await buildHex(arduinoCode);
    // console.log(result.stderr || result.stdout);
    if (!result.hex) {
      toast({
        title: 'Compile Error',
        description: result.stderr,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setRunningState(false);
      return "";
    }

    toast({
      title: 'Code Compiled',
      description: 'Code compiled successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })

    return result.hex;
  }


  const onArduinoCodeChange = (e: string | ChangeEventHandler<HTMLTextAreaElement> | any) => {
    if (typeof e === "string") {
      setArduinoCode(e);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setArduinoCode(e.target.value);
    }
  }

  const runCode = () => {
    setRunningState(true);
    compileAndRun().then((hex) => {
      if (hex) {
        AVRRunner.stopped = false;

        setHexcode(hex);


      }

    });
  }
  useEffect(() => {

    if (hexcode) {

      console.log(AVRRunner.stopped)
      console.log("Program running...");
      executeProgram(hexcode);
    }
  }, [hexcode])
  function stopCode() {
    setRunningState(false)
    AVRRunner.stopped = true;
    setHexcode("");
    setSer((prev) => prev + ("\n Program stopped"));
    console.log("Program stopped");
  }

  return (
    <Stack direction='column' spacing={4}>
      {/* <> */}
      <Text as='b' fontSize='xl'>Arduino Simulator</Text>
      <Stack direction='row'>
        <Button
          onClick={runCode}
          isLoading={isRunning}
        >
          Run
        </Button>
        <Button
          colorScheme='red'
          onClick={() => {
            stopCode()
          }}
        >
          Stop
        </Button>
        {/* </> */}
      </Stack>
      <Stack direction='row'>

        {
          online ? <Editor
            height={"70vh"}
            width={"50vw"}
            defaultLanguage="c"
            defaultValue={arduinoCode}
            onMount={handleEditorDidMount}
            theme='vs-dark'
            onChange={onArduinoCodeChange}
          /> : <>
            <Alert>
              <AlertTitle>
                No Internet Connection
              </AlertTitle>
              <AlertDescription>
                You will not be able to simulate, compile, or use advanced IDE features.
              </AlertDescription>
            </Alert>
            <Textarea height={"70vh"}
              width={"50vw"} value={arduinoCode} onChange={onArduinoCodeChange}
            />
          </>
        }
        <Card height={"70vh"} width={"50vw"}>
          <CardHeader>
            <Text as='b' fontSize='xl'>Serial Monitor</Text>
          </CardHeader>
          <CardBody>
            <Textarea isReadOnly height={"full"} value={ser} />

          </CardBody>
          <CardFooter>
            <Button
              colorScheme='red'
              onClick={() => {
                setSer("");
              }}
            >
              Clear
            </Button>
          </CardFooter>
        </Card>
      </Stack>
    </Stack>
  )
}


export default SimPage;