"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as THREE from "three";
import * as WEBIFC from "web-ifc";
import { FragmentsGroup } from "@thatopen/fragments";
import { Loader2 } from "lucide-react";
import useIfcStore from "@/stores/useIfcStore";

export default function IFCViewer({
  blobs,
  modelName,
}: {
  blobs: Blob[];
  modelName: string;
}) {
  const setIfcFiles = useIfcStore((state) => state.actions.setIFCFiles);
  // const models = useIfcStore((state) => state.models);
  const addModel = useIfcStore((state) => state.actions.addModel);
  const clearModels = useIfcStore((state) => state.actions.clearModels);
  const setHider = useIfcStore((state) => state.actions.setHider);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  // const [components, setComponents] = useState<OBC.Components | null>(null);
  const [world, setWorld] = useState<OBC.World | null>(null);
  const [fragments, setFragments] = useState<OBC.FragmentsManager | null>(null);
  // const [fragmentIfcLoader, setFragmentIfcLoader] =
  useState<OBC.IfcLoader | null>(null);
  // const [indexer, setIndexer] = useState<OBC.IfcRelationsIndexer | null>(null);
  const [model, setModel] = useState<FragmentsGroup | null>(null);
  const [plans, setPlans] = useState<OBCF.Plans | null>(null);
  const [culler, setCuller] = useState<OBC.MeshCullerRenderer | null>(null);
  const [highlighter, setHighlighter] = useState<OBCF.Highlighter | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // Dynamic orbit point
  const handleMouseMove = useCallback(
    (event: any) => {
      if (!isMouseDown) {
        const raycaster = new THREE.Raycaster();
        const normalizedMouse = new THREE.Vector2();

        const { clientX, clientY } = event;

        const elRect =
          world?.renderer?.three.domElement.getBoundingClientRect();
        if (!elRect) return;
        const canvasX = clientX - elRect!.left;
        const canvasY = clientY - elRect!.top;

        normalizedMouse.set(
          (canvasX / elRect.width) * 2.0 - 1.0,
          ((elRect.height - canvasY) / elRect.height) * 2.0 - 1.0
        );

        world?.camera.three.updateMatrixWorld();
        raycaster.setFromCamera(normalizedMouse, world!.camera.three);

        const intersections = raycaster.intersectObjects(
          world!.scene.three.children
        );

        // console.log(intersections);

        if (intersections.length !== 0) {
          const intersectionPoint = intersections[0].point;
          world!.camera.controls!.setOrbitPoint(
            intersectionPoint.x,
            intersectionPoint.y,
            intersectionPoint.z
          );
        }
      }
    },
    [isMouseDown]
  );

  // Load IFC model
  async function loadIfc(
    world: OBC.World,
    components: OBC.Components,
    fragments: OBC.FragmentsManager,
    fragmentIfcLoader: OBC.IfcLoader,
    culler: OBC.MeshCullerRenderer
  ) {
    setLoadingModel(true);
    // Loading Fragments
    const fragFile = await fetch(
      "https://syystorage.blob.core.windows.net/test/small.frag"
    );
    const fragData = await fragFile.arrayBuffer();
    const fragBuffer = new Uint8Array(fragData);
    const model = fragments.load(fragBuffer);
    world.scene.three.add(model);
    addModel({ fragmentsGroup: model, name: modelName });

    // const propsFile = await fetch(
    //   "https://syystorage.blob.core.windows.net/test/small.json"
    // );
    // const propsData = await propsFile.json();
    // model.setLocalProperties(propsData);

    for (const child of model.children) {
      if (child instanceof THREE.InstancedMesh) {
        culler.add(child);
      }
    }
    culler.needsUpdate = true;

    setLoadingModel(false);

    // const propsFile = await fetch(
    //   // "https://syystorage.blob.core.windows.net/test/dunbar-plumb-small.json"
    //   "https://syystorage.blob.core.windows.net/test/small.json"
    //   // "https://thatopen.github.io/engine_components/resources/small.json"
    // );
    // const propsData = await propsFile.json();
    // model.setLocalProperties(propsData);
    // setModel(model);

    // Loading plain ifc file
    // const file = await fetch(
    //   // "https://thatopen.github.io/engine_components/resources/small.ifc"
    //   // "https://syystorage.blob.core.windows.net/test/Dunbar_High_School_Mechanical.ifc"
    //   "https://syystorage.blob.core.windows.net/test/Dunbar_High_School_Plumbing.ifc"
    // );
    try {
    } catch (err) {
      console.error(err);
      setLoadingModel(false);
    }
  }

  async function loadPlainIfcModel(
    fragmentIfcLoader: OBC.IfcLoader,
    world: OBC.World,
    components: OBC.Components,
    file: Blob,
    culler: OBC.MeshCullerRenderer
  ) {
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    model.name = "example";
    world.scene.three.add(model);
    addModel({ fragmentsGroup: model, name: "test.ifc" });
    // End loading ifc
    for (const child of model.children) {
      if (child instanceof THREE.InstancedMesh) {
        culler.add(child);
      }
    }
    culler.needsUpdate = true;
    const fragmentBbox = components.get(OBC.BoundingBoxer);
    fragmentBbox.add(model);
    const bbox = fragmentBbox.getMesh();
    fragmentBbox.reset();
    world.camera.controls?.fitToSphere(bbox, true);
    // const indexer = components.get(OBC.IfcRelationsIndexer);
    // await indexer.process(model);
    // // setIndexer(indexer);
    // setModel(model);
    // setLoadingModel(false);
    // console.log("Loading plans");
    // const plans = components.get(OBCF.Plans);
    // plans.world = world;
    // await plans.generate(model);
    // setPlans(plans);
    // console.log("Plans loaded");
  }

  // async function loadModel(
  //   loader: OBCF.IfcStreamer,
  //   geometryURL: string,
  //   propertiesURL?: string
  // ) {
  //   const rawGeometryData = await fetch(geometryURL);
  //   console.log(rawGeometryData);
  //   const geometryData = await rawGeometryData.json();
  //   let propertiesData;
  //   if (propertiesURL) {
  //     const rawPropertiesData = await fetch(propertiesURL);
  //     propertiesData = await rawPropertiesData.json();
  //   }

  //   const model = await loader.load(geometryData, true, propertiesData);
  //   console.log(model);

  //   addModel({ fragmentsGroup: model, name: modelName });
  // }

  async function setup() {
    const container = document.getElementById("container")!;

    if (!container) {
      return;
    }

    const components = new OBC.Components();
    // setComponents(components);

    const worlds = components.get(OBC.Worlds);

    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.SimpleCamera(components);
    setWorld(world);

    // world.renderer.postproduction.enabled = true;
    // world.renderer.postproduction.customEffects.outlineEnabled = true;

    components.init();

    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

    world.scene.setup();

    // const grids = components.get(OBC.Grids);
    // grids.config.color.setHex(0x666666);
    // const grid = grids.create(world);
    // grid.three.position.y -= 1;
    // world.renderer.postproduction.customEffects.excludedMeshes.push(grid.three);

    world.scene.three.background = null;

    const fragments = components.get(OBC.FragmentsManager);
    const fragmentIfcLoader = components.get(OBC.IfcLoader);
    // setFragmentIfcLoader(fragmentIfcLoader);
    setFragments(fragments);

    await fragmentIfcLoader.setup();

    // const excludedCats = [
    //   WEBIFC.IFCTENDONANCHOR,
    //   WEBIFC.IFCREINFORCINGBAR,
    //   WEBIFC.IFCREINFORCINGELEMENT,
    //   WEBIFC.IFCSPACE,
    // ];

    // for (const cat of excludedCats) {
    //   fragmentIfcLoader.settings.excludedCategories.add(cat);
    // }

    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    // const loader = new OBCF.IfcStreamer(components);
    // loader.world = world;
    // loader.dbCleaner.enabled = true;
    // loader.useCache = true;

    // loader.culler.threshold = 1;
    // loader.culler.maxHiddenTime = 1;
    // loader.culler.maxLostTime = 1;

    // loader.url = `https://jpsdtxicbzmwllkoozdg.supabase.co/storage/v1/object/public/autobim/${facilityId}/${modelId}/streaming/`;

    // await loadModel(loader, loader.url + "small.ifc-processed.json");

    // world.camera.controls.addEventListener("sleep", () => {
    //   loader.culler.needsUpdate = true;
    // });
    // world.camera.controls.addEventListener("controlend", () => {
    //   loader.culler.needsUpdate = true;
    // });
    // world.camera.controls.addEventListener("transitionstart", () => {
    //   loader.culler.needsUpdate = true;
    // });

    // Create the culler
    const cullers = components.get(OBC.Cullers);
    const culler = cullers.create(world);
    culler.config.threshold = 200;
    setCuller(culler);
    world.camera.controls?.addEventListener("sleep", () => {
      culler.needsUpdate = true;
    });
    world.camera.controls?.addEventListener("controlend", () => {
      culler.needsUpdate = true;
    });
    world.camera.controls?.addEventListener("transitionstart", () => {
      culler.needsUpdate = true;
    });

    // Highligher
    const highlighter = components.get(OBCF.Highlighter);
    highlighter.setup({
      world,
      // hoverColor: new THREE.Color(0xffffff),
      // selectionColor: new THREE.Color(0xffffff),
    });
    highlighter.zoomToSelection = true;
    setHighlighter(highlighter);

    // Hider
    const hider = components.get(OBC.Hider);
    setHider(hider);

    // Hide all excluded categories

    // await loadIfc(world, components, fragments, fragmentIfcLoader, culler);
    for (const blob of blobs) {
      await loadPlainIfcModel(
        fragmentIfcLoader,
        world,
        components,
        blob,
        culler
      );
    }

    world.camera.updateAspect();
  }

  useEffect(() => {
    setup();

    return () => {
      fragments?.dispose();
      clearModels();
    };
  }, [blobs]);

  const onSelection = useCallback(
    async (fragmentIdMap: { [fragmentId: string]: Set<number> }) => {
      console.log(fragmentIdMap);
      // Get the selected fragment id
      const fragmentId = Object.values(fragmentIdMap)[0]?.values().next().value;

      const element = await model?.getProperties(fragmentId!);
      const name = element?.Name.value;
      console.log(name);
    },
    [model]
  );

  // Highlighter and on select element event
  useEffect(() => {
    if (!highlighter) return;

    highlighter?.events.select.onHighlight.add(onSelection);

    return () => {
      highlighter?.events.select.onHighlight.remove(onSelection);
    };
  }, [onSelection]);

  // useEffect(() => {
  //   window.addEventListener("mousedown", handleMouseDown);
  //   window.addEventListener("mouseup", handleMouseUp);
  //   window.addEventListener("mousemove", handleMouseMove);

  //   return () => {
  //     window.removeEventListener("mousedown", handleMouseDown);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //     window.removeEventListener("mousemove", handleMouseMove);
  //   };
  // }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  return (
    <div
      className="flex flex-1 cursor-grab relative"
      id="container"
      // ref={containerRef}
    >
      {/** Plans List */}
      {/* <div className="absolute top-0 left-0 z-50">
        {plans?.list.map((plan) => (
          <div
            key={plan.id}
            className="p-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              plans?.goTo(plan.id);
              if (culler) culler.needsUpdate = true;
            }}
          >
            {plan.name}
          </div>
        ))}

        <Button
          onClick={() => {
            plans?.exitPlanView();
            if (culler) culler.needsUpdate = true;
          }}
        >
          Exit Plan View
        </Button>
      </div> */}

      {loadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-90 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
