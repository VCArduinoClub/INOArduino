/* eslint-disable @typescript-eslint/no-misused-promises */
import Layout from '../../components/Layout';
import React, { useState, useRef, useEffect, ChangeEventHandler } from 'react';
// import { parse } from "intel-hex";
import { buildHex } from "./compile";
import { AVRRunner } from "./execute";
// import { formatTime } from "./format-time";
import { LEDElement } from "@wokwi/elements";
import { Alert, AlertDescription, AlertTitle, Button, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
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

const ArduinoSim = () => {
  // const [ledState, setLedState] = useState(false);
  const [isRunning, setRunningState] = useState(false);
  const [arduinoCode, setArduinoCode] = useState(exampleCode);
  const [online, setOnlineState] = useState(true);
  const [usingMonaco, setUsingMonaco] = useState(false);
  const textAreaMultiplier = 1; // Set the textarea height to the number of lines
  const textAreaHeight = arduinoCode.split(/\r\n|\r|\n/).length * textAreaMultiplier;
  const toast = useToast();
  const editorRef = useRef(null);

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


  async function executeProgram(hex: string) {
    let runner = new AVRRunner(hex);

    // // Hook to PORTB register
    //BELOW CODE IS for LED- will implement later
    // runner.portB.addListener(value => {

    //   // console.log(value)
    //   // for (const led of LEDs) {
    //   //   const pin = parseInt(led.getAttribute("pin"), 10);
    //   //   led.value = value & (1 << (pin - 8)) ? true : false;
    //   // }
    // });

    // Serial port output support
    // runner.usart.onByteTransmit = (value: number) => {
    //   console.log(String.fromCharCode(value));
    // };

     runner.execute(cpu => {
      const time = (cpu.cycles / runner.MHZ);
    });
    // }
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
      return;
        // console.log("\nProgram running...");
        // executeProgram(result.hex);
    }

    toast({
      title: 'Code Compiled',
      description: 'Code compiled successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })

    executeProgram(result.hex);
  }


  const onArduinoCodeChange = (e: string | ChangeEventHandler<HTMLTextAreaElement> | any) => {
    if (typeof e === "string") {
      setArduinoCode(e);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setArduinoCode(e.target.value);
    }
  }

  function stopCode() {
    console.log("stopped")
    setRunningState(false)
    //the below is what i got from how to stop it from the examle
    // if (runner) {
    // runner.stop();

    //   runner = null;
    // }
  }

  return (
    <Stack direction='column' spacing={4}>
      <Text as='b' fontSize='xl'>Arduino Simulator</Text>
      <Stack direction='row'>
        <Button
          onClick={() => {
            setRunningState(true);
            compileAndRun();
          }}
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

      </Stack>
      {
        online ? <Editor
          height="90vh"
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
          <Textarea value={arduinoCode} onChange={onArduinoCodeChange} height="90vh" />
        </>
      }
    </Stack>
  )
}


export default SimPage;