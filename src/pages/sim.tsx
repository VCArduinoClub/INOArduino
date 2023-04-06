/* eslint-disable @typescript-eslint/no-misused-promises */
import Layout from '../components/Layout';
import React, { useState, useRef, useEffect, ChangeEventHandler} from 'react';
import { parse } from "intel-hex.ts";
import { Alert, AlertDescription, AlertTitle, Button, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portDConfig,
  PinState,
  AVRTimer,
  timer0Config
} from 'avr8js';
import Editor, { Monaco } from "@monaco-editor/react";


const SimPage = () => {
    return (
        <Layout>
          <ArduinoSim />
        </Layout>
    )
}

const exampleCode = 
`
void setup() {
  // put your setup code here, to run once:
  pinMode(7, OUTPUT); 
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(7, HIGH);
  delay(1000);
  digitalWrite(7, LOW);
  delay(1000);
}
`;

const ArduinoSim = () => {
  const [ledState, setLedState] = useState(false);
  const [isRunning, setRunningState] = useState(false);
  const [arduinoCode, setArduinoCode] = useState(exampleCode);
  const [online, setOnlineState] = useState(true);
  const [usingMonaco, setUsingMonaco] = useState(false);
  const textAreaMultiplier = 2; // Set the textarea height to the number of lines
  const textAreaHeight = arduinoCode.split(/\r\n|\r|\n/).length * textAreaMultiplier;
  const errorToast = useToast();
  const editorRef = useRef(null);

  useEffect(function(){
    if (typeof window !== "undefined"){
      setOnlineState(navigator.onLine)
      window.addEventListener("offline", function(){
        setOnlineState(false);
      });
      window.addEventListener("online", function(){
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

  const runCode = async () => {
    let _isRunning = true;
    if (!navigator.onLine){
      setRunningState(false);
      _isRunning = false;
      errorToast({
        title: "No internet connection.",
        description: "You need to be connected to the internet in order to use the simulator. Learn more: https://inoarduino.vclubs.page/support/XDF-AB2-Simulator-Requires-Internet-Access",
        status: "error",
        duration: 10000,
        isClosable: false
      });
      return
    }
    // Compile the arduino source code
    console.log("Running code");
    const result = await fetch('https://hexi.wokwi.com/build', {
      method: 'post',
      body: JSON.stringify({ sketch: arduinoCode }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const { hex, stderr } = await result.json() as { hex: string, stderr: string };
    if (!hex) {
      // alert(stderr);
      errorToast({
        title: 'Compile Error',
        description: stderr,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return
    } 
    console.log("Code compiled...");
    // If "parse" complains about not having an argument for `bufferSize`: update the package.
    const { data } = parse(hex); 
    const progData = new Uint8Array(data);
    console.log(data);
    // Set up the simulation
    const cpu = new CPU(new Uint16Array(progData.buffer));
    // Attach the virtual hardware
    const port = new AVRIOPort(cpu, portDConfig);
    port.addListener(() => {
      const turnOn = port.pinState(7) === PinState.High;
      setLedState(turnOn);
      console.log('LED', turnOn);
    });
    console.log("Simulator setup complete");
    errorToast({
      title: 'Code Compiled',
      description: 'Code compiled successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
    console.log("Setting up AVRTimer...");
    const timer = new AVRTimer(cpu, timer0Config);
    console.log("Timer setup complete.");
    // Run the simulation
    console.log("isRunning: " + isRunning.toString());
    while (isRunning) {
      // console.log("Loop is running...");
      for (let i = 0; i < 500000; i++) {
        // console.group("CPU Cycle: " + i.toString());
        // console.log("Starting CPU cycle...")
        avrInstruction(cpu);
        // console.log("Instruction executed.");
        cpu.tick();
        // console.log("Timer ticked.");
        // console.groupEnd();
      }
      await new Promise(resolve => setTimeout(resolve));
    }
  }


  const onArduinoCodeChange = (e: string | ChangeEventHandler<HTMLTextAreaElement> | any) => {
    if (typeof e === "string"){
      setArduinoCode(e);  
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setArduinoCode(e.target.value);
    }
  }

  const stopCode = () => {
    setRunningState(false);
  }

  return (
    <Stack direction='column' spacing={4}>
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
      <Text>
        LED State: {ledState ? 'ON' : 'OFF'}
      </Text>
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