/* eslint-disable @typescript-eslint/no-misused-promises */
import Layout from "../../components/Layout";
import { useState, useRef, useEffect, ChangeEventHandler } from "react";
import { buildHex } from "../../utils/sim/compile";
import { AVRRunner } from "../../utils/sim/execute";
import { LEDElement, ServoElement } from "@wokwi/elements";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Stack,
  Text,
  Textarea,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
} from "@chakra-ui/react";
import Editor, { Monaco } from "@monaco-editor/react";
import LessonData from "../../lessons/lessons.json";
import { set } from "zod";

enum ArduinoSimState {
  NOTHING = "Arduino is not running",
  PREPARING = "Preparing to run Arduino code",
  COMPILING = "Compiling Arduino code",
  REMOTE_COMPILING = "Compiling Arduino code on remote server",
  FINISHED_COMPILE = "Finished compiling Arduino code",
  RUNNING = "Running Arduino code",
  STOPPED = "Arduino code stopped",
  ERROR = "Error running Arduino code",
  CATASTROPHIC_ERROR = "Catastrophic error running Arduino code: Check console",
  SIMULATORCORE_ERROR = "Error in AVRRunner: Check console",
}

const SimPage = () => {
  const [lessonsmenu, setLessons] = useState([]);

  useEffect(() => {
    let lessonsarr: any = [];
    LessonData.lessons.map((lesson: any) => {
      [lessonsarr.push({
        path: `/lessons/${lesson.file}`,
        title: lesson.title,
      })]
    })
    setLessons(lessonsarr)
  }, []);

  console.log(
    "[InoArduino] Simulator dumps to console a lot - disable Debug in console to hide"
  );

  return (
    <Layout lessons={lessonsmenu}>
      <ArduinoSim />
    </Layout>
  );
};

const exampleCode = `
// This is an example program for the Arduino Simulator
// It blinks the onboard LED and the two LEDs on pins 11, 12, and 13
// The simulator will print the state of the LEDs to the serial monitor
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
  const [isRunning, setRunningState] = useState(false);
  const [arduinoCode, setArduinoCode] = useState(exampleCode);
  const [online, setOnlineState] = useState(true);
  const [hexcode, setHexcode] = useState("");
  const [ser, setSer] = useState("");
  const [usingMonaco, setUsingMonaco] = useState(false);
  const [simState, setSimState] = useState<ArduinoSimState>(
    ArduinoSimState.NOTHING
  );
  const [currentLesson, setCurrentLesson] = useState("");
  const [elements, setElements] = useState<string[]>([]);

  const textAreaMultiplier = 1; // Set the textarea height to the number of lines
  const textAreaHeight =
    arduinoCode.split(/\r\n|\r|\n/).length * textAreaMultiplier;
  const toast = useToast();
  const editorRef = useRef(null);
  let runner: AVRRunner;

  useEffect(
    function () {
      if (typeof window !== "undefined") {
        setOnlineState(navigator.onLine);
        window.addEventListener("offline", function () {
          setOnlineState(false);
        });
        window.addEventListener("online", function () {
          setOnlineState(true);
        });
      }
    },
    [online]
  );

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

    runner
      .execute((cpu) => {
        const time = cpu.cycles / runner.MHZ;
        console.debug(
          `[InoArduino] SimulatorTime: ${time} {${cpu.cycles}} / ${runner.MHZ} = ${time} seconds}`
        );
      })
      .catch((err) => {
        console.group("[InoArduino] Error in SimulatorCore (AVRRunner)");
        console.log(`CPU Cycles: ${runner.cpu.cycles}`);
        console.log(`CPU PC: ${runner.cpu.pc}`);
        console.log(`CPU MHZ: ${runner.MHZ}`);
        console.debug("CPU State:");
        console.debug(runner.cpu);
        console.debug("CPU Memory:");
        console.debug(runner.cpu.progMem);
        console.debug("CPU SP");
        console.debug(runner.cpu.SP);
        console.debug("CPU SREG");
        console.debug(runner.cpu.SREG);
        console.error(err);
        console.groupEnd();
        setRunningState(false);
        setSimState(ArduinoSimState.CATASTROPHIC_ERROR);
      });
    // console.log(runner)
  }

  async function compileAndRun() {
    console.log("Compiling...");
    setSimState(ArduinoSimState.REMOTE_COMPILING);
    const result = await buildHex(arduinoCode);
    // console.log(result.stderr || result.stdout);
    if (!result.hex) {
      console.group(
        "[InoArduino] Error in Simulator: Compile Error [User error] "
      );
      console.error(result.stderr);
      console.groupEnd();
      toast({
        title: "Compile Error",
        description: result.stderr,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setRunningState(false);
      setSimState(ArduinoSimState.ERROR);
      return "";
    }

    toast({
      title: "Code Compiled",
      description: "Code compiled successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    setSimState(ArduinoSimState.FINISHED_COMPILE);
    return result.hex;
  }

  const getLessonFromURL = () => {
    // Grab the lesson ID from the URL
    // https://inoarduino.com/sim?lesson=1
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const lesson = url.searchParams.get("lesson");
      if (lesson) {
        setCurrentLesson(lesson);
        dynamicLoadLesson(lesson);
        return lesson;
      } else {
        return "";
      }
    }
  };

  const dynamicLoadLesson = (lessonID: string) => {
    if (lessonID === "") {
      return;
    }
    const lesson = LessonData.lessons.find(
      (lesson: any) => lesson.id === parseInt(lessonID)
    );
    if (lesson) {
      console.group("[InoArduino] Simulator::SelectLesson");
      // Load the lesson code
      console.debug(`Loading lesson code: ~/lessons/code/${lesson.simCode}`);
      if (!lesson.hasOwnProperty("simCode")) {
        setArduinoCode(
          `// This lesson does not have any code. Please select another lesson.`
        );
        console.log("User requested lesson with no code");
        console.groupEnd();
        return;
      }
      if (lesson.element != "null") {
        const elem = [...elements, lesson.element]
        setElements(elem)
      }
      import("/src/lessons/code/" + lesson.simCode)
        .then((code) => {
          console.log(code);
          setArduinoCode(code.default);
          console.log("Loaded lesson code");
          console.groupEnd();
          return;
        })
        .catch((err) => {
          console.group("[InoArduino] Error in Simulator::SelectLesson");
          console.error(err);
          console.groupEnd();
          console.groupEnd();
          return;
        });
    } else {
      console.group("[InoArduino] Error in Simulator::SelectLesson");
      console.error(`Lesson not found: ${lessonID}`);
      console.groupEnd();
      console.groupEnd();
      return;
    }
  };

  const onArduinoCodeChange = (
    e: string | ChangeEventHandler<HTMLTextAreaElement> | any
  ) => {
    if (typeof e === "string") {
      setArduinoCode(e);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setArduinoCode(e.target.value);
    }
  };

  const runCode = () => {
    setRunningState(true);
    setSimState(ArduinoSimState.PREPARING);
    compileAndRun()
      .then((hex) => {
        if (hex) {
          setSimState(ArduinoSimState.RUNNING);
          AVRRunner.stopped = false;
          setHexcode(hex);
        }
      })
      .catch((err) => {
        console.group("[InoArduino] Error in SimulatorCore (AVRRunner)");
        console.error(err);
        console.groupEnd();
        setRunningState(false);
        setSimState(ArduinoSimState.SIMULATORCORE_ERROR);
      });
  };
  useEffect(() => {
    if (hexcode) {
      console.log(AVRRunner.stopped);
      console.log("Program running...");
      executeProgram(hexcode);
    }
  }, [hexcode]);

  useEffect(() => {
    getLessonFromURL();
  }, []);
  function stopCode() {
    setRunningState(false);
    AVRRunner.stopped = true;
    setHexcode("");
    setSer((prev) => prev + "\n [InoArduino] Program stopped");
    console.log("Program stopped");
    setSimState(ArduinoSimState.STOPPED);
  }

  return (
    <Stack direction="column" spacing={4}>
      {/* <> */}
      <Text as="b" fontSize="xl">
        Arduino Simulator
      </Text>
      
      <Stack direction="row">
        <Button onClick={runCode} isLoading={isRunning}>
          Run
        </Button>
        <Button
          colorScheme="red"
          onClick={() => {
            stopCode();
          }}
        >
          Stop
        </Button>
        {/* </> */}
        <Text>
          <b>Simulator State:</b> {simState}
        </Text>
        <Select
          placeholder="Select Lesson"
          onChange={(e) => {
            setCurrentLesson(e.target.value);
            dynamicLoadLesson(e.target.value);
          }}
          value={currentLesson}
        >
          {LessonData.lessons.map((lesson: any) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </Select>
      </Stack>
      <Stack direction="row">
        {online ? (
          <Editor
            height={"70vh"}
            width={"50vw"}
            defaultLanguage="c"
            onMount={handleEditorDidMount}
            theme="vs-dark"
            onChange={onArduinoCodeChange}
            value={arduinoCode}
          />
        ) : (
          <>
            <Alert>
              <AlertTitle>No Internet Connection</AlertTitle>
              <AlertDescription>
                You will not be able to simulate, compile, or use advanced IDE
                features.
              </AlertDescription>
            </Alert>
            <Textarea
              height={"70vh"}
              width={"50vw"}
              value={arduinoCode}
              onChange={onArduinoCodeChange}
            />
          </>
        )}
        <Card height={"70vh"} width={"50vw"}>
          <CardHeader>
            <Text as="b" fontSize="xl">
              Serial Monitor
            </Text>
          </CardHeader>
          <CardBody>
            <Textarea isReadOnly height={"full"} value={ser} />
          </CardBody>
          <CardFooter>
            <Button
              colorScheme="red"
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
  );
};

export default SimPage;
