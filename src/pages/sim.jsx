import Layout from '../components/Layout';
import React from 'react';
import { parse } from 'intel-hex';
import { Button, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portDConfig,
  PinState,
  AVRTimer,
  timer0Config
} from 'avr8js';

const SimPage = () => {
    return (
        <Layout>
          <ArduinoSim></ArduinoSim>
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
  const [ledState, setLedState] = React.useState(false);
  const [isRunning, setRunningState] = React.useState(false);
  const [arduinoCode, setArduinoCode] = React.useState(exampleCode);
  const errorToast = useToast();

  const runCode = async () => {
    // Compile the arduino source code
    setRunningState(true);
    const result = await fetch('https://hexi.wokwi.com/build', {
      method: 'post',
      body: JSON.stringify({ sketch: arduinoCode }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const { hex, stderr } = await result.json();
    if (!hex) {
      setRunningState(false);
      // alert(stderr);
      errorToast({
        title: 'Compile Error',
        description: stderr,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return;
    } 
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
    const timer = new AVRTimer(cpu, timer0Config);
    // Run the simulation
    while (isRunning) {
      for (let i = 0; i < 500000; i++) {
        avrInstruction(cpu);
        timer.tick();
      }
      await new Promise(resolve => setTimeout(resolve));
    }
  };

  const onArduinoCodeChange = (e) => {
    setArduinoCode(e.target.value);  
  }

  const stopCode = (e) => {
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
        onClick={stopCode}
      >
        Stop 
      </Button>
      </Stack>
      <Textarea
      size='lg'
      paddingLeft={10}
      spellCheck={false}
      isDisabled={isRunning}
      onChange={onArduinoCodeChange}>
        {arduinoCode}
      </Textarea>
      
    </Stack>
  );
}


export default SimPage;