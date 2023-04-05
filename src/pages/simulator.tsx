import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import path from 'path';
import '@wokwi/elements';
import { Link, Heading, Text, Alert, AlertIcon, AlertTitle, AlertDescription, ListItem, UnorderedList, OrderedList,   Divider, Code, Box } from "@chakra-ui/react";
import Layout from '../components/Layout'
import { NextPage } from 'next';
import { parse } from 'intel-hex';
import { useState } from 'react'
import {
    CPU,
    avrInstruction,
    AVRIOPort,
    portDConfig,
    PinState,
    AVRTimer,
    timer0Config
  } from 'avr8js';

enum SimulatorState {
    NotStarted = "Not Started...",
    Starting = "Starting...",
    Compiling = "Compiling...",
    Executing = "Running...",
    Stopped = "Stopped..."
}

enum PinStateSim {
    ON,
    OFF
}

export default function SimulatorPage(): JSX.Element {
    const [ledState, setLEDState] = useState<PinStateSim>(PinStateSim.OFF);
    const [simulatorState, setSimulatorState] = useState<SimulatorState>(SimulatorState.NotStarted);
    const [codeState, setCodeState] = useState<string>(`
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
    `);

    const runCode = async () => {
        setSimulatorState(SimulatorState.Starting);
        setTimeout(function(){
            setSimulatorState(SimulatorState.Compiling);
        }, 200)
        const result = await fetch('https://hexi.wokwi.com/build', {
            method: 'post',
            body: JSON.stringify({ sketch: codeState }),
            headers: {
              'Content-Type': 'application/json'
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { hex, stderr } = await result.json();
        if (!hex) {
          alert(stderr);
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unused-vars
        const { data } = parse(hex);
        const progData = new Uint8Array(data);
        console.log(data);
        // Set up the simulation
        const cpu = new CPU(new Uint16Array(progData.buffer));
        // Attach the virtual hardware
        const port = new AVRIOPort(cpu, portDConfig);
        port.addListener(() => {
          const turnOn = port.pinState(7) === PinState.High;
          setLEDState(turnOn ? PinStateSim.ON : PinStateSim.OFF);
          console.log('LED', turnOn);
        });
        const timer = new AVRTimer(cpu, timer0Config);
        while (true) {
            for (let i = 0; i < 500000; i++) {
              avrInstruction(cpu);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              timer.tick();
            }
            await new Promise(resolve => setTimeout(resolve));
        }
    }
  return (
    <>
    <Head>
        <title>Simulator</title>
    </Head>
    <Layout>
              <div className="post-header">
                  <Heading as="h2" size="xl" mb={5}>
                      {"We up"}
                  </Heading>
                  <div className="post-subheader text-2xl">This is the INOArduino Official Simulator.</div>
                  <Divider />
              </div>
              <main>
              <wokwi-led color="red" value={ledState ? true : false} />
              <button onClick={runCode}>Run</button>
              <textarea
                    value={codeState}
                    readOnly
                    style={{ width: '100%' }}
                    rows={20}
                />
              </main>
          </Layout>
    </>
  )
}
