import api from "@/lib/api";
import { atom, useAtom } from "jotai";

// Enum to define the roles in the chat
export enum MessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

// Type definition for a chat message
export type ChatMessage = {
  role: MessageRole;
  content: string | null;
  id?: string;
  ifcFileContent?: string;
  isStreamingIfc?: boolean;
};

export const messagesAtom = atom<ChatMessage[]>([
  //   {
  //     role: MessageRole.user,
  //     content: "Welcome to the chat! Ask me anything.",
  //   },
  //   {
  //     role: MessageRole.assistant,
  //     content: `<thinking> I'll create a simple IFC model representing a cube with dimensions of 1x1x1 meter. The model will include: 1. Basic IFC header information 2. Project context and units 3. Spatial structure (Project -> Site -> Building -> Building Storey) 4. A cube geometry using IfcExtrudedAreaSolid 5. Necessary relationships and placements </thinking>
  //   I'll generate an IFC file representing a simple cube for you. This model contains a basic spatial hierarchy and a cube represented as an IfcBuildingElementProxy.
  // <ifc>
  // ISO-10303-21;
  // HEADER;
  // FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');
  // FILE_NAME('cube.ifc','2023-10-23',('Da Vinci'),('AI Assistant'),'IFC Engine','IFC Engine','');
  // FILE_SCHEMA(('IFC2X3'));
  // ENDSEC;
  // DATA;
  // /* Project Context */
  // #1= IFCPROJECT('1HspfKvnj3deBjkh6_DD1X',#2,'Cube Project',$,$,$,$,(#20),#7);
  // #2= IFCOWNERHISTORY(#3,#6,$,.ADDED.,1698062400,$,$,1698062400);
  // #3= IFCPERSONANDORGANIZATION(#4,#5,$);
  // #4= IFCPERSON($,'Da Vinci',$,$,$,$,$,$);
  // #5= IFCORGANIZATION($,'AI Assistant',$,$,$);
  // #6= IFCAPPLICATION(#5,'1.0','IFC Engine','Engine');
  // /* Units */
  // #7= IFCUNITASSIGNMENT((#8,#9,#10,#11,#15,#16,#17));
  // #8= IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
  // #9= IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
  // #10= IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);
  // #11= IFCCONVERSIONBASEDUNIT(#12,.PLANEANGLEUNIT.,'DEGREE',#13);
  // #12= IFCDIMENSIONALEXPONENTS(0,0,0,0,0,0,0);
  // #13= IFCMEASUREWITHUNIT(IFCRATIOMEASURE(0.017453293),#14);
  // #14= IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);
  // #15= IFCSIUNIT(*,.MASSUNIT.,$,.GRAM.);
  // #16= IFCSIUNIT(*,.TIMEUNIT.,$,.SECOND.);
  // #17= IFCSIUNIT(*,.THERMODYNAMICTEMPERATUREUNIT.,$,.KELVIN.);
  // /* Geometric Context */
  // #20= IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,#21,$);
  // #21= IFCAXIS2PLACEMENT3D(#22,$,$);
  // #22= IFCCARTESIANPOINT((0.0,0.0,0.0));
  // /* Site */
  // #100= IFCSITE('2HspfKvnj3deBjkh6_DD1X',#2,'Site',$,$,#101,$,$,.ELEMENT.,$,$,$,$,$);
  // #101= IFCLOCALPLACEMENT($,#21);
  // /* Building */
  // #200= IFCBUILDING('3HspfKvnj3deBjkh6_DD1X',#2,'Building',$,$,#201,$,$,.ELEMENT.,$,$,$);
  // #201= IFCLOCALPLACEMENT(#101,#21);
  // /* Building Storey */
  // #300= IFCBUILDINGSTOREY('4HspfKvnj3deBjkh6_DD1X',#2,'Level 0',$,$,#301,$,$,.ELEMENT.,0.0);
  // #301= IFCLOCALPLACEMENT(#201,#21);
  // /* Relationships for Spatial Structure */
  // #400= IFCRELAGGREGATES('5HspfKvnj3deBjkh6_DD1X',#2,'Site Container','',#1,(#100));
  // #401= IFCRELAGGREGATES('6HspfKvnj3deBjkh6_DD1X',#2,'Building Container','',#100,(#200));
  // #402= IFCRELAGGREGATES('7HspfKvnj3deBjkh6_DD1X',#2,'Storey Container','',#200,(#300));
  // /* Shape Representation */
  // #30= IFCSHAPEREPRESENTATION(#20,'Body','SweptSolid',(#40));
  // /* Geometry */
  // #40= IFCEXTRUDEDAREASOLID(#41,#44,#47,1.0);
  // #41= IFCRECTANGLEPROFILEDEF(.AREA.,$,#42,1.0,1.0);
  // #42= IFCAXIS2PLACEMENT2D(#43,$);
  // #43= IFCCARTESIANPOINT((0.0,0.0));
  // #44= IFCAXIS2PLACEMENT3D(#45,#46,$);
  // #45= IFCCARTESIANPOINT((0.0,0.0,0.0));
  // #46= IFCDIRECTION((0.0,0.0,1.0));
  // #47= IFCDIRECTION((0.0,0.0,1.0));
  // /* Cube Element */
  // #50= IFCBUILDINGELEMENTPROXY('8HspfKvnj3deBjkh6_DD1X',#2,'Cube',$,$,#51,#54,$);
  // #51= IFCLOCALPLACEMENT(#301,#52);
  // #52= IFCAXIS2PLACEMENT3D(#53,$,$);
  // #53= IFCCARTESIANPOINT((0.0,0.0,0.0));
  // #54= IFCPRODUCTDEFINITIONSHAPE($,$,(#30));
  // /* Relationship to connect Cube to Building Storey */
  // #500= IFCRELCONTAINEDINSPATIALSTRUCTURE('9HspfKvnj3deBjkh6_DD1X',#2,'Building Storey Container','',(#50),#300);
  // ENDSEC;
  // END-ISO-10303-21;
  // </ifc>
  //   This IFC file defines:
  //   A cube with dimensions of 1x1x1 meter
  //   The cube is created using an extruded rectangular profile
  //   The spatial hierarchy (Project -> Site -> Building -> Building Storey)
  //   All necessary relationships and placements
  //   Standard units (meters, square meters, cubic meters)
  //   You can open this file in any IFC-compatible viewer (like BIMvision, FZKViewer, or Solibri) to see the cube visualization. The cube is represented as an IfcBuildingElementProxy since it's a generic geometric shape rather than a specific building element type.`,
  //   },
]);
const generatingAtom = atom(false);
const abortControllerAtom = atom<AbortController>(new AbortController());
const selectedIfcFileAtom = atom<{
  index: number;
  content: string;
} | null>(null);
const artifactModeAtom = atom<"preview" | "file">("file");

export function useChat() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [generating, setGenerating] = useAtom(generatingAtom);
  const [abortController, setAbortController] = useAtom(abortControllerAtom);
  const [artifactMode, setArtifactMode] = useAtom(artifactModeAtom);

  const [selectedIfcFile, setSelectedIfcFile] = useAtom(selectedIfcFileAtom);

  const addMessage = (newMessage: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleAbort = () => {
    if (abortController) {
      console.log("Aborting generation...");
      abortController.abort();
      setGenerating(false);
      setAbortController(new AbortController());
    }
  };

  const updateLatestAssistantMessage = (updatedContent: string) => {
    setMessages((prevMessages) => {
      let updatedMessages = [...prevMessages];
      let lastMessage = updatedMessages[updatedMessages.length - 1];
      lastMessage.content += updatedContent;

      return updatedMessages;
    });
  };

  const generateText = async (messagesToSend: ChatMessage[]) => {
    setGenerating(true);

    const messageHandler = (message: string) => {
      updateLatestAssistantMessage(message);
    };

    try {
      const gen = await api.generateText(messagesToSend);
      await gen(
        messageHandler,
        () => {
          setGenerating(false);
        },
        abortController.signal
      );
    } catch (error) {
      console.log("Generation aborted or failed", error);
    } finally {
      setGenerating(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSelectedIfcFile(null);
  };

  return {
    messages,
    handleAbort,
    generating,
    addMessage,
    setSelectedIfcFile,
    selectedIfcFile,
    updateLatestAssistantMessage,
    resetChat,
    generateText,
    artifactMode,
    setArtifactMode,
  };
}
